package com.xyz.lastdemo.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDTO {

    // Users
    private long totalUsers;
    private long totalConsumers;
    private long totalWorkers;
    private long pendingWorkerApprovals;
    private long activeWorkers;

    // Bookings
    private long totalBookings;
    private long pendingBookings;
    private long confirmedBookings;
    private long inProgressBookings;
    private long completedBookings;
    private long cancelledBookings;

    // Revenue
    private BigDecimal totalRevenue;
    private BigDecimal revenueThisMonth;
    private long totalPayments;
    private long successfulPayments;
    private long failedPayments;
}