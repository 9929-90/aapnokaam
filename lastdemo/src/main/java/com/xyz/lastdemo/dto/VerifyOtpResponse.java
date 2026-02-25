package com.xyz.lastdemo.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VerifyOtpResponse {

    private String resetToken;
    private String message;
    private boolean success;
}