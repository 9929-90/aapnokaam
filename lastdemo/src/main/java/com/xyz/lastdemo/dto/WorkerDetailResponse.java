package com.xyz.lastdemo.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerDetailResponse {
    private Long id;
    private Long userId;
    private String workerId;
    private String fullName;
    private String profilePictureUrl;
    private String bio;
    private Integer experienceYears;
    private BigDecimal hourlyRate;
    private String city;
    private String state;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private Boolean isAvailable;
    private Boolean isVerified;
    private BigDecimal averageRating;
    private Integer totalReviews;
    private Integer totalJobsCompleted;
    private String languagesSpoken;
    private Integer responseRate;
    private List<WorkerSkillDTO> skills;
    private List<ReviewDTO> recentReviews;
    private LocalDate joinedDate;
}
