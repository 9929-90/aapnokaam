package com.xyz.lastdemo.dto;


import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingWorkerDTO {
    private Long id;
    private String username;
    private String email;
    private String panNumber;
    private String createdAt;
}
