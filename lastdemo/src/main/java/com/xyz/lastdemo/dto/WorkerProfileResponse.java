package com.xyz.lastdemo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Worker Profile Response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String profilePictureUrl;
    private String bio;
    private Integer experienceYears;
    private BigDecimal hourlyRate;
    private String address;
    private String city;
    private String state;
    private String pincode;

    // GPS Coordinates
    private Double latitude;
    private Double longitude;

    private Boolean isAvailable;
    private BigDecimal averageRating;
    private Integer totalReviews;
    private Integer totalJobsCompleted;
    private String languagesSpoken;
    private Boolean isVerified;
    private List<WorkerSkillDTO> skills;
}