package com.xyz.lastdemo.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsumerStatsResponse {
    private Integer totalBookings;
    private Integer pendingBookings;
    private Integer confirmedBookings;
    private Integer completedBookings;
    private Integer cancelledBookings;
    private Integer totalReviewsGiven;
    private BigDecimal totalSpent;
    private Integer favoriteWorkersCount;
    private String memberSince;
}
