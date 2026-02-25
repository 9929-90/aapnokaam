package com.xyz.lastdemo.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Worker Profile Entity
 * Extended profile information for workers
 */
@Entity
@Table(name = "worker_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"skills", "reviews"})
@ToString(exclude = {"skills", "reviews"})
public class WorkerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Column(name = "profile_picture_url", length = 500)
    private String profilePictureUrl;

    @Column(name = "bio", length = 500)
    private String bio;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(name = "address", length = 200)
    private String address;

    @Column(name = "city", length = 50)
    private String city;

    @Column(name = "state", length = 50)
    private String state;

    @Column(name = "pincode", length = 10)
    private String pincode;

    // GPS Coordinates for location-based search
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    // Transient field - calculated during search, not stored in DB
    @Transient
    private Double distance; // Distance from consumer in kilometers

    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private Boolean isAvailable = false;

    @Column(name = "average_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(name = "total_reviews")
    @Builder.Default
    private Integer totalReviews = 0;

    @Column(name = "total_jobs_completed")
    @Builder.Default
    private Integer totalJobsCompleted = 0;

    @Column(name = "languages_spoken", length = 200)
    private String languagesSpoken;

    @Column(name = "government_id_type", length = 50)
    private String governmentIdType;

    @Column(name = "government_id_number", length = 50)
    private String governmentIdNumber;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @OneToMany(mappedBy = "worker", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WorkerSkill> skills = new ArrayList<>();

    @OneToMany(mappedBy = "worker", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper methods
    public void addSkill(WorkerSkill skill) {
        skills.add(skill);
        skill.setWorker(this);
    }

    public void removeSkill(WorkerSkill skill) {
        skills.remove(skill);
        skill.setWorker(null);
    }

    public void updateRating(BigDecimal newRating) {
        if (totalReviews == 0) {
            this.averageRating = newRating;
            this.totalReviews = 1;
        } else {
            BigDecimal totalRating = this.averageRating.multiply(new BigDecimal(totalReviews));
            totalRating = totalRating.add(newRating);
            this.totalReviews++;
            this.averageRating = totalRating.divide(new BigDecimal(totalReviews), 2, BigDecimal.ROUND_HALF_UP);
        }
    }
}