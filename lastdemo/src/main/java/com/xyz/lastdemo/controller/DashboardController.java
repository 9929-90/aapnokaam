package com.xyz.lastdemo.controller;

import com.xyz.lastdemo.dto.DashboardResponse;
import com.xyz.lastdemo.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Dashboard controller - protected endpoint for all authenticated users
 * Returns role-specific welcome messages
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    /**
     * Get dashboard data based on user role
     * GET /api/dashboard
     * Requires: Valid JWT token (any authenticated role)
     */
    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(
            @AuthenticationPrincipal User user) {

        String message = switch (user.getRole()) {
            case ADMIN -> "Welcome Admin";
            case WORKER -> "Welcome Worker, " + user.getUsername();
            case CONSUMER -> "Welcome Client";
        };

        return ResponseEntity.ok(
                DashboardResponse.builder()
                        .message(message)
                        .username(user.getUsername())
                        .role(user.getRole().name())
                        .build()
        );
    }
}