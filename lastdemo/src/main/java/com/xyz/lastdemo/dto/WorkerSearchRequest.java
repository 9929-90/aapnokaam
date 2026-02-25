package com.xyz.lastdemo.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerSearchRequest {
    private Long categoryId;
    private String city;
    private String state;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private Double radiusKm;
    private Double minRating;
    private Double maxHourlyRate;
    private Boolean availableOnly;
    private String sortBy;
    private Integer page;
    private Integer size;
}
