package com.xyz.lastdemo.controller;

import com.xyz.lastdemo.dto.MessageResponse;
import com.xyz.lastdemo.dto.NotificationDTO;
import com.xyz.lastdemo.entity.User;
import com.xyz.lastdemo.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Notification Controller
 * Handles real-time notifications for users
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get all notifications for current user
     * GET /api/notifications
     */
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                notificationService.getUserNotifications(user.getId(), unreadOnly, page, size));
    }

    /**
     * Mark notification as read
     * PUT /api/notifications/{notificationId}/read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<MessageResponse> markAsRead(
            @AuthenticationPrincipal User user,
            @PathVariable Long notificationId) {
        notificationService.markAsRead(user.getId(), notificationId);
        return ResponseEntity.ok(MessageResponse.builder()
                .success(true)
                .message("Notification marked as read")
                .build());
    }

    /**
     * Mark all notifications as read
     * PUT /api/notifications/read-all
     */
    @PutMapping("/read-all")
    public ResponseEntity<MessageResponse> markAllAsRead(
            @AuthenticationPrincipal User user) {
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(MessageResponse.builder()
                .success(true)
                .message("All notifications marked as read")
                .build());
    }

    /**
     * Get unread notification count
     * GET /api/notifications/unread-count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Integer> getUnreadCount(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.getUnreadCount(user.getId()));
    }

    /**
     * Delete notification
     * DELETE /api/notifications/{notificationId}
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<MessageResponse> deleteNotification(
            @AuthenticationPrincipal User user,
            @PathVariable Long notificationId) {
        notificationService.deleteNotification(user.getId(), notificationId);
        return ResponseEntity.ok(MessageResponse.builder()
                .success(true)
                .message("Notification deleted")
                .build());
    }
}