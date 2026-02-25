package com.xyz.lastdemo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Stores newsletter / update subscribers.
 * Email is the unique key — duplicate submissions are rejected gracefully.
 * Subscribers can unsubscribe via a UUID token sent in every email.
 */
@Entity
@Table(name = "email_subscriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    /** Token embedded in unsubscribe links — never shown in the UI. */
    @Column(nullable = false, unique = true, length = 100)
    private String unsubscribeToken;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @Column(updatable = false)
    private LocalDateTime subscribedAt;

    private LocalDateTime unsubscribedAt;

    @PrePersist
    protected void onCreate() {
        subscribedAt = LocalDateTime.now();
    }
}