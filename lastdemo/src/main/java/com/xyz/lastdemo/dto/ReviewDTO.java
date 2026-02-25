package com.xyz.lastdemo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Review DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private Long id;
    private String consumerName;
    private String consumerProfilePicture;
    private BigDecimal rating;
    private String comment;
    private Boolean isVerified;
    private Integer helpfulCount;
    private LocalDateTime createdAt;
}