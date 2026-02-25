package com.xyz.lastdemo.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPaymentDTO {

    private Long id;
    private Long bookingId;
    private String serviceTitle;

    private String consumerName;
    private String consumerEmail;

    private String razorpayOrderId;
    private String razorpayPaymentId;

    private BigDecimal amount;
    private String currency;
    private String status;
    private String failureReason;

    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}