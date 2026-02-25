package com.xyz.lastdemo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The booking this payment belongs to (one-to-one)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    // Razorpay order ID returned when you create an order (e.g. "order_xxxxx")
    @Column(name = "razorpay_order_id", unique = true)
    private String razorpayOrderId;

    // Razorpay payment ID returned after successful payment (e.g. "pay_xxxxx")
    @Column(name = "razorpay_payment_id", unique = true)
    private String razorpayPaymentId;

    // Razorpay signature returned after payment — used for verification
    @Column(name = "razorpay_signature")
    private String razorpaySignature;

    // Amount in INR (stored as paise in Razorpay, but we store full rupees here)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    // Optional: failure reason from Razorpay
    @Column(name = "failure_reason")
    private String failureReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Timestamp when payment was successfully verified
    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}