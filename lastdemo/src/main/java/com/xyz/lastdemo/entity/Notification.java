package com.xyz.lastdemo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Notification Entity
 * Stores notifications for users
 */
@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_user_created", columnList = "user_id, created_at"),
        @Index(name = "idx_user_read", columnList = "user_id, is_read")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "message", nullable = false, length = 500)
    private String message;

    @Column(name = "notification_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @Column(name = "related_entity_id")
    private Long relatedEntityId; // ID of related conversation, job, review, etc.

    @Column(name = "action_url", length = 500)
    private String actionUrl;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum NotificationType {

        NEW_MESSAGE("New Message", "💬"),
        NEW_REVIEW("New Review", "⭐"),
        JOB_REQUEST("Job Request", "💼"),
        JOB_ACCEPTED("Job Accepted", "✅"),
        JOB_COMPLETED("Job Completed", "🎉"),
        PAYMENT_RECEIVED("Payment Received", "💰"),
        PROFILE_UPDATE("Profile Update", "👤"),
        SYSTEM("System Notification", "🔔"),

        NEW_BOOKING("New Booking", "📋"),
        BOOKING_CONFIRMED("Booking Confirmed", "✅"),
        BOOKING_CANCELLED("Booking Cancelled", "❌"),
        BOOKING_COMPLETED("Booking Completed", "🎉"),
        BOOKING_IN_PROGRESS("Booking In Progress", "⏳"),

        PAYMENT_REFUNDED("Payment Refunded", "💸"),
        ACCOUNT_APPROVED("Account Approved", "✅"),
        ACCOUNT_REJECTED("Account Rejected", "❌"),
        SYSTEM_ANNOUNCEMENT("System Announcement", "📢");

        private final String displayName;
        private final String icon;

        NotificationType(String displayName, String icon) {
            this.displayName = displayName;
            this.icon = icon;
        }

        public String getDisplayName() {
            return displayName;
        }

        public String getIcon() {
            return icon;
        }
    }

}