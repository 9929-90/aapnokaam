package com.xyz.lastdemo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Worker Skill DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkerSkillDTO {
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryDescription;
    private String categoryIcon;
    private String proficiencyLevel;
    private Integer yearsOfExperience;
    private Boolean isPrimary;
}