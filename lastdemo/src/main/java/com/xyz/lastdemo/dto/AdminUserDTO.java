package com.xyz.lastdemo.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDTO {

    private Long id;
    private String email;
    private String username;
    private String name;
    private String phone;
    private String role;
    private boolean enabled;
    private boolean emailVerified;
    private boolean workerApproved;

    // Consumer-specific
    private String consumerFullName;
    private Long totalBookings;

    // Worker-specific
    private String workerFullName;
    private String city;
    private Double averageRating;
    private Integer totalJobsCompleted;
    private Boolean isAvailable;
    private Boolean isVerified;

    private LocalDateTime createdAt;
}