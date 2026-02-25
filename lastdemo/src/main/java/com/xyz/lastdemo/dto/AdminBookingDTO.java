package com.xyz.lastdemo.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminBookingDTO {

    private Long id;
    private String serviceTitle;
    private String categoryName;

    // Consumer
    private Long consumerId;
    private String consumerName;
    private String consumerEmail;

    // Worker
    private Long workerId;
    private String workerName;
    private String workerEmail;

    private String status;
    private String paymentStatus;

    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private BigDecimal totalAmount;

    private String city;
    private String address;

    private LocalDateTime scheduledDate;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private String cancelledBy;
}