package com.xyz.lastdemo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Skill Category DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillCategoryDTO {
    private Long id;
    private String name;
    private String description;
    private String iconUrl;
    private Boolean isActive;
}