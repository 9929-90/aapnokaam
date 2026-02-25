package com.xyz.lastdemo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Worker Dashboard Response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerDashboardResponse {
    private String workerName;
    private String workerId;
    private Boolean isAvailable;
    private BigDecimal averageRating;
    private Integer totalReviews;
    private Integer totalJobsCompleted;
    private Integer unreadMessages;
    private Integer unreadNotifications;
    private List<String> primarySkills;
    private WorkerStatsResponse stats;
}