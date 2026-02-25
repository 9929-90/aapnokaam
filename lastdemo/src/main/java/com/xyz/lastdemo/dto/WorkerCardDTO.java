package com.xyz.lastdemo.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerCardDTO {
    private Long id;
    private Long userId;
    private String workerId;
    private String fullName;
    private String profilePictureUrl;
    private String primarySkill;
    private Integer experienceYears;
    private BigDecimal hourlyRate;
    private String city;
    private String state;
    private Boolean isAvailable;
    private Boolean isVerified;
    private BigDecimal averageRating;
    private Integer totalReviews;
    private Integer totalJobsCompleted;

    // Location fields for distance calculation
    private Double latitude;
    private Double longitude;
    private Double distance; // Distance from consumer in kilometers (calculated field)
}