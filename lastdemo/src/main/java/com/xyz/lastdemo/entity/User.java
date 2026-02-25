package com.xyz.lastdemo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * User entity implementing Spring Security UserDetails.
 * Supports multi-role authentication with email verification,
 * worker approval workflow, and OTP-based password reset.
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    // Full name — used by PaymentService to prefill Razorpay checkout modal
    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)  // ← change to:
    private String password;

    // Phone number — nullable for existing rows
    @Column(length = 15)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    // ─── Email Verification ───────────────────────────────────────────────────

    private boolean emailVerified;

    private String emailVerificationToken;

    private LocalDateTime emailVerificationTokenExpiry;

    // ─── Worker-Specific ──────────────────────────────────────────────────────

    private String panNumber;       // Encrypted/hashed

    private boolean workerApproved;

    private String workerId;

    // ─── OTP Password Reset ───────────────────────────────────────────────────

    /**
     * SHA-256 hash of the 6-digit OTP sent to the user's email.
     * Never stored in plain text.
     */
    @Column(name = "otp_hash")
    private String otpHash;

    /**
     * Expiry timestamp for the OTP (10 minutes from issuance).
     */
    @Column(name = "otp_expiry")
    private LocalDateTime otpExpiry;

    /**
     * SHA-256 hash of the short-lived reset token issued after OTP verification.
     * Never stored in plain text.
     */
    @Column(name = "password_reset_token")
    private String passwordResetToken;

    /**
     * Expiry timestamp for the reset token (15 minutes from OTP verification).
     */
    @Column(name = "password_reset_token_expiry")
    private LocalDateTime passwordResetTokenExpiry;

    // ─── Account Status ───────────────────────────────────────────────────────

    private boolean enabled;

    private boolean accountNonExpired;

    private boolean accountNonLocked;

    private boolean credentialsNonExpired;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt              = LocalDateTime.now();
        updatedAt              = LocalDateTime.now();
        accountNonExpired      = true;
        accountNonLocked       = true;
        credentialsNonExpired  = true;
        enabled                = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ─── Spring Security UserDetails ──────────────────────────────────────────

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() { return password; }

    /** Returns email as the login identifier (not the username field). */
    @Override
    public String getUsername() { return email; }

    @Override public boolean isAccountNonExpired()     { return accountNonExpired; }
    @Override public boolean isAccountNonLocked()      { return accountNonLocked; }
    @Override public boolean isCredentialsNonExpired() { return credentialsNonExpired; }
    @Override public boolean isEnabled()               { return enabled; }

    /**
     * Role-aware login guard.
     * ADMIN    → enabled only
     * CONSUMER → enabled + email verified
     * WORKER   → enabled + email verified + admin approved
     */
    public boolean canLogin() {
        if (role == UserRole.ADMIN)    return enabled;
        if (role == UserRole.CONSUMER) return enabled && emailVerified;
        if (role == UserRole.WORKER)   return enabled && emailVerified && workerApproved;
        return false;
    }

    // ─── OAuth2 ───────────────────────────────────────────────────────────────────
    @Column(name = "google_id", unique = true)
    private String googleId;

    @Column(name = "auth_provider")
    @Builder.Default
    private String authProvider = "LOCAL"; // LOCAL or GOOGLE
}