package com.xyz.lastdemo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Availability Request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityRequest {
    private Boolean isAvailable;
}
