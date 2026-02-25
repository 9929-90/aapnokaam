package com.xyz.lastdemo.service;

import com.xyz.lastdemo.dto.ForgotPasswordRequest;
import com.xyz.lastdemo.dto.MessageResponse;
import com.xyz.lastdemo.dto.ResetPasswordRequest;
import com.xyz.lastdemo.dto.VerifyOtpRequest;
import com.xyz.lastdemo.dto.VerifyOtpResponse;
import com.xyz.lastdemo.entity.User;
import com.xyz.lastdemo.exception.AuthException;
import com.xyz.lastdemo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

/**
 * Handles the 3-step forgot-password flow:
 *
 *  1. forgotPassword()  → generate OTP → email it → store its SHA-256 hash + expiry
 *  2. verifyOtp()       → validate OTP → issue a short-lived reset token (UUID, hashed)
 *  3. resetPassword()   → validate reset token → update password → clear all fields
 *
 * Nothing is stored in plain text:
 *  - OTP         : SHA-256 hashed in the DB column `otp_hash`
 *  - Reset token : SHA-256 hashed in the DB column `password_reset_token`
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class OtpService {

    private static final int OTP_LENGTH          = 6;
    private static final int OTP_EXPIRY_MINUTES  = 10;
    private static final int TOKEN_EXPIRY_MINUTES = 15;

    private final UserRepository  userRepository;
    private final EmailService    emailService;
    private final PasswordEncoder passwordEncoder;

    // ─── Step 1: Forgot Password ──────────────────────────────────────────────

    /**
     * Sends a 6-digit OTP to the supplied email.
     * Always returns a generic success message to avoid user-enumeration attacks.
     */
    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String otp          = generateOtp();
            String hashedOtp    = sha256(otp);
            LocalDateTime expiry = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);

            user.setOtpHash(hashedOtp);
            user.setOtpExpiry(expiry);
            // clear any stale reset token from a previous attempt
            user.setPasswordResetToken(null);
            user.setPasswordResetTokenExpiry(null);
            userRepository.save(user);

            emailService.sendOtpEmail(user.getEmail(), otp);
            log.info("Password-reset OTP sent to: {}", user.getEmail());
        });

        return MessageResponse.builder()
                .message("If that email is registered, you will receive a password-reset OTP shortly.")
                .success(true)
                .build();
    }

    // ─── Step 2: Verify OTP ───────────────────────────────────────────────────

    /**
     * Verifies the 6-digit OTP.
     * On success, invalidates the OTP and issues a 15-minute reset token.
     */
    @Transactional
    public VerifyOtpResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Invalid request"));

        // Guard: no OTP has been issued
        if (user.getOtpHash() == null || user.getOtpExpiry() == null) {
            throw new AuthException("No OTP has been issued for this account. Please request a new one.");
        }

        // Guard: OTP expired
        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            clearOtp(user);
            userRepository.save(user);
            throw new AuthException("OTP has expired. Please request a new one.");
        }

        // Guard: OTP mismatch
        if (!sha256(request.getOtp()).equals(user.getOtpHash())) {
            throw new AuthException("Invalid OTP. Please check and try again.");
        }

        // OTP is valid — invalidate it and issue a reset token
        String rawResetToken   = UUID.randomUUID().toString();
        String hashedResetToken = sha256(rawResetToken);

        clearOtp(user);
        user.setPasswordResetToken(hashedResetToken);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusMinutes(TOKEN_EXPIRY_MINUTES));
        userRepository.save(user);

        log.info("OTP verified. Reset token issued for: {}", user.getEmail());

        return VerifyOtpResponse.builder()
                .resetToken(rawResetToken)      // raw token returned to client
                .message("OTP verified. Use the reset token to set your new password.")
                .success(true)
                .build();
    }

    // ─── Step 3: Reset Password ───────────────────────────────────────────────

    /**
     * Validates the reset token and updates the user's password.
     */
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        // Passwords match?
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AuthException("Passwords do not match");
        }

        // Find user whose hashed reset token matches
        String hashedToken = sha256(request.getResetToken());
        User user = userRepository.findByPasswordResetToken(hashedToken)
                .orElseThrow(() -> new AuthException("Invalid or expired reset token"));

        // Token expired?
        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            clearResetToken(user);
            userRepository.save(user);
            throw new AuthException("Reset token has expired. Please start over.");
        }

        // All good — update password and wipe all OTP / reset fields
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        clearOtp(user);
        clearResetToken(user);
        userRepository.save(user);

        log.info("Password reset successfully for: {}", user.getEmail());

        return MessageResponse.builder()
                .message("Password reset successfully. You can now login with your new password.")
                .success(true)
                .build();
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Generates a cryptographically secure 6-digit numeric OTP.
     */
    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100_000 + random.nextInt(900_000); // always 6 digits
        return String.valueOf(otp);
    }

    /**
     * SHA-256 hash — used for both OTPs and reset tokens so nothing sensitive
     * sits in plain text in the database.
     */
    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private void clearOtp(User user) {
        user.setOtpHash(null);
        user.setOtpExpiry(null);
    }

    private void clearResetToken(User user) {
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
    }
}