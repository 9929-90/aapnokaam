package com.xyz.lastdemo.dto;

import lombok.*;

import java.math.BigDecimal;

/**
 * Sent to the frontend after creating a Razorpay order.
 * The frontend uses these fields to open the Razorpay checkout modal.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentOrderResponse {

    // Your Razorpay Key ID (public, safe to send to frontend)
    private String razorpayKeyId;

    // Razorpay order ID — e.g. "order_xxxxx"
    private String razorpayOrderId;

    // Amount in INR (human-readable, e.g. 500.00)
    private BigDecimal amount;

    // Currency, always "INR"
    private String currency;

    // Our internal booking ID (so frontend can reference it)
    private Long bookingId;

    // Internal payment record ID
    private Long paymentId;

    // Prefill fields for Razorpay modal
    private String customerName;
    private String customerEmail;
    private String customerPhone;
}