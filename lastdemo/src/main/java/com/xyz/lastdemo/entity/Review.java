package com.xyz.lastdemo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Review Entity
 * Stores reviews and ratings for workers
 */
@Entity
@Table(name = "reviews", indexes = {
        @Index(name = "idx_worker_id", columnList = "worker_id"),
        @Index(name = "idx_consumer_id", columnList = "consumer_id"),
        @Index(name = "idx_booking_id", columnList = "booking_id"),
        @Index(name = "idx_rating", columnList = "rating")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to booking (one review per booking)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    // Link to worker
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private WorkerProfile worker;

    // Link to consumer
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consumer_id", nullable = false)
    private ConsumerProfile consumer;

    // Rating: 1.0 to 5.0
    @Column(name = "rating", nullable = false, precision = 2, scale = 1)
    private BigDecimal rating;

    // Review comment
    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    // Optional: reference to job if needed
    @Column(name = "job_id")
    private Long jobId;

    // Verified flag
    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    // Helpful votes count
    @Column(name = "helpful_count")
    @Builder.Default
    private Integer helpfulCount = 0;

    // Audit timestamps
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
