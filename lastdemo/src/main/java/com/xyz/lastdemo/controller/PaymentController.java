package com.xyz.lastdemo.controller;

import com.xyz.lastdemo.dto.*;
import com.xyz.lastdemo.entity.User;
import com.xyz.lastdemo.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * STEP 1 — Create a Razorpay order for a booking.
     *
     * Called by the consumer after a booking is created.
     * Returns the Razorpay order ID + key so the frontend can open the checkout modal.
     *
     * POST /api/payments/create-order/{bookingId}
     */
    @PostMapping("/create-order/{bookingId}")
    @PreAuthorize("hasRole('CONSUMER')")
    public ResponseEntity<PaymentOrderResponse> createOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.createOrder(user.getId(), bookingId));
    }

    /**
     * STEP 2 — Verify payment after Razorpay checkout modal succeeds.
     *
     * Frontend sends back the three values Razorpay gives after payment.
     * We verify the HMAC signature and mark the booking as CONFIRMED.
     *
     * POST /api/payments/verify
     */
    @PostMapping("/verify")
    @PreAuthorize("hasRole('CONSUMER')")
    public ResponseEntity<MessageResponse> verifyPayment(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PaymentVerificationRequest request) {
        return ResponseEntity.ok(paymentService.verifyPayment(user.getId(), request));
    }

    /**
     * Get payment status for a booking.
     * Both consumer and worker can call this to check payment state.
     *
     * GET /api/payments/booking/{bookingId}
     */
    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('CONSUMER') or hasRole('WORKER')")
    public ResponseEntity<PaymentStatusResponse> getPaymentStatus(
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(bookingId));
    }
}