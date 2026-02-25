package com.xyz.lastdemo.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OAuth2GoogleRequest {
    private String token;      // Google ID token from frontend
    private String role;       // "CONSUMER" or "WORKER"
}