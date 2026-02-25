package com.xyz.lastdemo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Update Skills Request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSkillsRequest {
    private List<SkillUpdateItem> skills;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillUpdateItem {
        private Long categoryId;
        private String proficiencyLevel; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
        private Integer yearsOfExperience;
        private Boolean isPrimary;
    }
}
