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
public class WorkerLoginRequest {

    @NotNull(message = "Worker ID is required")
    private Long workerId;

    @NotBlank(message = "Password is required")
    private String password;
}