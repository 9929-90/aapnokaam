package com.xyz.lastdemo.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitReviewRequest {
    private Integer rating;
    private String comment;
}
