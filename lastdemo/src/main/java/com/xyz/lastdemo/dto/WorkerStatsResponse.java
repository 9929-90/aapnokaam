package com.xyz.lastdemo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Worker Stats Response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerStatsResponse {
    private Integer totalJobsCompleted;
    private Integer jobsThisMonth;
    private BigDecimal totalEarnings;
    private BigDecimal earningsThisMonth;
    private BigDecimal averageRating;
    private Integer totalReviews;
    private Integer responseRate; // Percentage
    private String memberSince;
}