package com.xyz.lastdemo.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDetailResponse {
    private Long id;
    private String consumerName;
    private String consumerPhone;
    private String workerName;
    private String workerPhone;
    private String workerProfilePicture;
    private String categoryName;
    private String serviceTitle;
    private String serviceDescription;
    private LocalDateTime scheduledDate;
    private LocalDateTime scheduledTime;
    private Integer estimatedDuration;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private BigDecimal hourlyRate;
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private String status;
    private String paymentStatus;
    private String cancellationReason;
    private String cancelledBy;
    private Boolean hasReview;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
}
