package com.xyz.lastdemo.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCardDTO {
    private Long id;
    private String workerName;
    private String workerProfilePicture;
    private String categoryName;
    private String serviceTitle;
    private LocalDateTime scheduledDate;
    private LocalDateTime scheduledTime;
    private Integer estimatedDuration;
    private BigDecimal estimatedCost;
    private String status;
    private String paymentStatus;
    private LocalDateTime createdAt;
}
