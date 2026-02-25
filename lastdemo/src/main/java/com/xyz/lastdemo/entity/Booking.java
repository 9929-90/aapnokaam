package com.xyz.lastdemo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings", indexes = {
        @Index(name = "idx_consumer_id", columnList = "consumer_id"),
        @Index(name = "idx_worker_id", columnList = "worker_id"),
        @Index(name = "idx_status", columnList = "status"),
        @Index(name = "idx_scheduled_date", columnList = "scheduled_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consumer_id", nullable = false)
    private ConsumerProfile consumer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worker_id", nullable = false)
    private WorkerProfile worker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private SkillCategory category;

    @Column(nullable = false)
    private String serviceTitle;

    @Column(columnDefinition = "TEXT")
    private String serviceDescription;

    @Column(nullable = false)
    private LocalDateTime scheduledDate;

    @Column(nullable = false)
    private LocalDateTime scheduledTime;

    @Column(nullable = false)
    private Integer estimatedDuration; // in hours

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false, length = 10)
    private String pincode;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal estimatedCost;

    @Column(precision = 10, scale = 2)
    private BigDecimal actualCost;

    /**
     * The final amount the consumer must pay.
     * Populated when the booking is confirmed so the payment order
     * always uses a settled figure.
     *
     * Resolution order used by PaymentService:
     *   1. actualCost  (set when worker completes the job)
     *   2. estimatedCost (set at booking creation time)
     */
    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status;

    @Column(columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(length = 20)
    private String cancelledBy; // CONSUMER or WORKER

    private LocalDateTime confirmedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    private Review review;

    // One-to-one with Payment (Payment owns the FK)
    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL)
    private Payment payment;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    // ─────────────────────────────────────────────────────────────
    // Convenience method used by PaymentService to resolve the
    // amount to charge. Prefers actualCost, falls back to
    // estimatedCost, and throws if neither is set.
    // ─────────────────────────────────────────────────────────────
    public BigDecimal getTotalAmount() {
        if (totalAmount != null) return totalAmount;
        if (actualCost != null) return actualCost;
        if (estimatedCost != null) return estimatedCost;
        throw new IllegalStateException(
                "Booking " + id + " has no amount set (totalAmount, actualCost, estimatedCost are all null)");
    }

    // ─────────────────────────────────────────────────────────────
    // BookingStatus is kept as an inner enum so all booking-related
    // constants stay in one place. PaymentService references it as:
    //     booking.setStatus(BookingStatus.CONFIRMED)
    // after importing com.xyz.lastdemo.entity.BookingStatus  ← see note below
    // ─────────────────────────────────────────────────────────────
    public enum BookingStatus {
        PENDING,      // Consumer created booking, awaiting worker
        CONFIRMED,    // Worker accepted
        IN_PROGRESS,  // Work started
        COMPLETED,    // Work finished
        CANCELLED,    // Cancelled by either party
        REJECTED      // Worker rejected
    }
}