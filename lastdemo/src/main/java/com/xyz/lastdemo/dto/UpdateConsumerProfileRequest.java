package com.xyz.lastdemo.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateConsumerProfileRequest {
    private String fullName;
    private String phoneNumber;
    private String address;
    private String city;
    private String state;
    private String pincode;
}
