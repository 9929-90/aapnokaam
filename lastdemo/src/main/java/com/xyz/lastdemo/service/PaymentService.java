package com.xyz.lastdemo.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.xyz.lastdemo.dto.*;
import com.xyz.lastdemo.entity.*;
import com.xyz.lastdemo.repository.BookingRepository;
import com.xyz.lastdemo.repository.PaymentRepository;
import com.xyz.lastdemo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    // ─────────────────────────────────────────────────────────────
    // 1. CREATE ORDER
    //    Called by consumer after a booking is saved.
    //    Creates a Razorpay order and saves a PENDING Payment record.
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public PaymentOrderResponse createOrder(Long consumerId, Long bookingId) {

        // 1a. Fetch and validate booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        // 1b. Ensure this consumer owns the booking
        if (!booking.getConsumer().getUser().getId().equals(consumerId)) {
            throw new RuntimeException("Access denied: booking does not belong to this consumer");
        }

        // 1c. Prevent duplicate payment for same booking
        if (paymentRepository.existsByBookingIdAndStatus(bookingId, PaymentStatus.SUCCESS)) {
            throw new RuntimeException("Payment already completed for booking: " + bookingId);
        }

        // 1d. Delete any stale PENDING payment so we create a fresh Razorpay order
        paymentRepository.findByBookingIdAndStatus(bookingId, PaymentStatus.PENDING)
                .ifPresent(paymentRepository::delete);

        // 1e. Calculate amount
        BigDecimal amount = booking.getTotalAmount();

        // 1f. Create Razorpay order
        Order razorpayOrder = createRazorpayOrder(amount, bookingId);
        String razorpayOrderId = razorpayOrder.get("id");

        // 1g. Save PENDING payment record
        Payment payment = Payment.builder()
                .booking(booking)
                .razorpayOrderId(razorpayOrderId)
                .amount(amount)
                .currency("INR")
                .status(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        // 1h. Fetch consumer details for prefill
        User consumer = userRepository.findById(consumerId)
                .orElseThrow(() -> new RuntimeException("Consumer not found"));

        log.info("Razorpay order created: {} for booking: {}", razorpayOrderId, bookingId);

        return PaymentOrderResponse.builder()
                .razorpayKeyId(razorpayKeyId)
                .razorpayOrderId(razorpayOrderId)
                .amount(amount)
                .currency("INR")
                .bookingId(bookingId)
                .paymentId(payment.getId())
                .customerName(consumer.getName())
                .customerEmail(consumer.getEmail())
                .customerPhone(consumer.getPhone())
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    // 2. VERIFY PAYMENT
    //    Called by consumer after Razorpay checkout modal succeeds.
    //    Verifies HMAC signature, marks payment SUCCESS,
    //    and marks booking CONFIRMED.
    // ─────────────────────────────────────────────────────────────
    @Transactional
    public MessageResponse verifyPayment(Long consumerId, PaymentVerificationRequest request) {

        // 2a. Find payment by Razorpay order ID
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException(
                        "Payment not found for order: " + request.getRazorpayOrderId()));

        // 2b. Ensure booking belongs to this consumer
        Booking booking = payment.getBooking();
        if (!booking.getConsumer().getUser().getId().equals(consumerId)) {
            throw new RuntimeException("Access denied");
        }

        // 2c. Verify Razorpay HMAC signature
        boolean isValid = verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!isValid) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Invalid payment signature");
            paymentRepository.save(payment);
            log.warn("Invalid Razorpay signature for order: {}", request.getRazorpayOrderId());
            throw new RuntimeException("Payment verification failed: invalid signature");
        }

        // 2d. Update payment record to SUCCESS
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        // 2e. Confirm the booking
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setPaymentStatus(PaymentStatus.SUCCESS);
        booking.setConfirmedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        log.info("Payment verified successfully. Order: {}, Payment: {}",
                request.getRazorpayOrderId(), request.getRazorpayPaymentId());

        // 2f. Send confirmation emails (non-blocking — email failure won't roll back transaction)
        try {
            User consumer = booking.getConsumer().getUser();
            User worker   = booking.getWorker().getUser();

            emailService.sendBookingConfirmationEmail(
                    consumer.getEmail(),
                    consumer.getName(),
                    booking
            );

            emailService.sendWorkerBookingNotificationEmail(
                    worker.getEmail(),
                    worker.getName(),
                    booking
            );
        } catch (Exception e) {
            log.error("Failed to send booking confirmation emails for booking {}: {}",
                    booking.getId(), e.getMessage());
        }

        return MessageResponse.builder()
                .message("Payment successful! Booking confirmed.")
                .success(true)
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    // 3. GET PAYMENT STATUS
    //    Used by both consumer and worker to check payment state.
    // ─────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public PaymentStatusResponse getPaymentStatus(Long bookingId) {

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException(
                        "No payment record found for booking: " + bookingId));

        return PaymentStatusResponse.builder()
                .paymentId(payment.getId())
                .bookingId(bookingId)
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayPaymentId(payment.getRazorpayPaymentId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .paidAt(payment.getPaidAt())
                .failureReason(payment.getFailureReason())
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────

    private Order createRazorpayOrder(BigDecimal amount, Long bookingId) {
        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject options = new JSONObject();
            options.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValue());
            options.put("currency", "INR");
            options.put("receipt", "booking_" + bookingId);
            options.put("payment_capture", 1);

            return client.orders.create(options);

        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order for booking {}: {}", bookingId, e.getMessage());
            throw new RuntimeException("Failed to create payment order. Please try again.");
        }
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(
                    razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);

            byte[] hashBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String generatedSignature = HexFormat.of().formatHex(hashBytes);

            return generatedSignature.equals(signature);

        } catch (Exception e) {
            log.error("Signature verification error: {}", e.getMessage());
            return false;
        }
    }
}