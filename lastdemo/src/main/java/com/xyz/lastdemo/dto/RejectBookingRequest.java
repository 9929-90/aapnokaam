package com.xyz.lastdemo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// ========== Worker Booking Management DTOs ==========

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RejectBookingRequest {
    private String reason;
}