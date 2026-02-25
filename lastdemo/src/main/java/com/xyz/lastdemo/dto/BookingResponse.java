package com.xyz.lastdemo.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    // ── Booking fields ────────────────────────────────────────────
    private Long bookingId;
    private String status;
    private String message;
    private BigDecimal estimatedCost;

    // ── Razorpay fields (populated immediately after booking) ─────
    // Frontend uses these to open the Razorpay checkout modal
    // without making a second API call.

    // Your public Razorpay Key ID (safe to expose to frontend)
    private String razorpayKeyId;

    // Razorpay order ID — e.g. "order_xxxxx"
    private String razorpayOrderId;

    // Internal payment record ID
    private Long paymentId;

    // Prefill fields for Razorpay modal
    private String customerName;
    private String customerEmail;
    private String customerPhone;
}