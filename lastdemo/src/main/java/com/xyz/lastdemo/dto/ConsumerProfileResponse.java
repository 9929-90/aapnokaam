package com.xyz.lastdemo.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsumerProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String profilePictureUrl;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private Integer totalBookings;
    private Integer totalReviewsGiven;
    private LocalDate memberSince;
}
