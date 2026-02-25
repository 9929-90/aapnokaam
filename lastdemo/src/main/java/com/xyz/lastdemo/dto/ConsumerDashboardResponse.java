package com.xyz.lastdemo.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsumerDashboardResponse {
    private String consumerName;
    private Integer totalBookings;
    private Integer upcomingBookings;
    private Integer unreadMessages;
    private Integer unreadNotifications;
    private List<BookingCardDTO> recentBookings;
    private ConsumerStatsResponse stats;

    // NEW: Add featured/all workers for dashboard
    private List<WorkerCardDTO> featuredWorkers;
}