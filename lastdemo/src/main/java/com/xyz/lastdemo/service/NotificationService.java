package com.xyz.lastdemo.service;

import com.xyz.lastdemo.dto.NotificationDTO;
import com.xyz.lastdemo.entity.Notification;
import com.xyz.lastdemo.entity.User;
import com.xyz.lastdemo.exception.ResourceNotFoundException;
import com.xyz.lastdemo.exception.UnauthorizedException;
import com.xyz.lastdemo.repository.NotificationRepository;
import com.xyz.lastdemo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Notification Service
 * Handles real-time notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Get notifications for user
     */
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUserNotifications(Long userId, boolean unreadOnly, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notificationPage;

        if (unreadOnly) {
            notificationPage = notificationRepository
                    .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable);
        } else {
            notificationPage = notificationRepository
                    .findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }

        return notificationPage.getContent().stream()
                .map(this::mapNotificationToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create and send notification
     */
    @Transactional
    public void createNotification(User user, String title, String message,
                                   Notification.NotificationType type,
                                   Long relatedEntityId, String actionUrl) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .relatedEntityId(relatedEntityId)
                .actionUrl(actionUrl)
                .isRead(false)
                .build();

        notificationRepository.save(notification);

        // Send real-time notification via WebSocket
        NotificationDTO notificationDTO = mapNotificationToDTO(notification);
        sendNotificationViaWebSocket(user.getId(), notificationDTO);

        log.info("Notification created for user {}: {}", user.getId(), title);
    }

    /**
     * Mark notification as read
     */
    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = getNotificationById(notificationId);
        validateNotificationOwner(userId, notification);

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);

        log.info("Notification {} marked as read by user {}", notificationId, userId);
    }

    /**
     * Mark all notifications as read
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, Pageable.unpaged())
                .getContent();

        LocalDateTime now = LocalDateTime.now();
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notification.setReadAt(now);
        }

        notificationRepository.saveAll(unreadNotifications);
        log.info("All notifications marked as read for user {}", userId);
    }

    /**
     * Get unread notification count
     */
    @Transactional(readOnly = true)
    public Integer getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    /**
     * Delete notification
     */
    @Transactional
    public void deleteNotification(Long userId, Long notificationId) {
        Notification notification = getNotificationById(notificationId);
        validateNotificationOwner(userId, notification);

        notificationRepository.delete(notification);
        log.info("Notification {} deleted by user {}", notificationId, userId);
    }

    // Helper methods

    private Notification getNotificationById(Long notificationId) {
        return notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
    }

    private void validateNotificationOwner(Long userId, Notification notification) {
        if (!notification.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to access this notification");
        }
    }

    private void sendNotificationViaWebSocket(Long userId, NotificationDTO notificationDTO) {
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                notificationDTO
        );
    }

    private NotificationDTO mapNotificationToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType().name())
                .typeIcon(notification.getType().getIcon())
                .relatedEntityId(notification.getRelatedEntityId())
                .actionUrl(notification.getActionUrl())
                .isRead(notification.getIsRead())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}