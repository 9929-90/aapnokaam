package com.xyz.lastdemo.controller;

import com.xyz.lastdemo.dto.*;
import com.xyz.lastdemo.service.AuthService;
import com.xyz.lastdemo.service.OAuth2Service;
import com.xyz.lastdemo.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller.
 * Public endpoints for registration, login, email verification,
 * and the 3-step OTP-based forgot-password flow.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService  otpService;
    private final OAuth2Service oAuth2Service;

    // ─── Registration ─────────────────────────────────────────────────────────

    /** POST /api/auth/register/consumer */
    @PostMapping("/register/consumer")
    public ResponseEntity<MessageResponse> registerConsumer(
            @Valid @RequestBody ConsumerRegistrationRequest request) {
        return ResponseEntity.ok(authService.registerConsumer(request));
    }

    /** POST /api/auth/register/worker */
    @PostMapping("/register/worker")
    public ResponseEntity<MessageResponse> registerWorker(
            @Valid @RequestBody WorkerRegistrationRequest request) {
        return ResponseEntity.ok(authService.registerWorker(request));
    }

    // ─── Email Verification ───────────────────────────────────────────────────

    /** GET /api/auth/verify-email?token=xxx */
    @GetMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(@RequestParam String token) {
        return ResponseEntity.ok(authService.verifyEmail(token));
    }

    /** POST /api/auth/resend-verification */
    @PostMapping("/resend-verification")
    public ResponseEntity<MessageResponse> resendVerificationEmail(
            @Valid @RequestBody ResendVerificationRequest request) {
        authService.resendVerificationEmail(request.getEmail());
        return ResponseEntity.ok(
                MessageResponse.builder()
                        .message("Verification email resent. Please check your inbox.")
                        .success(true)
                        .build()
        );
    }

    // ─── Login ────────────────────────────────────────────────────────────────

    /** POST /api/auth/login */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /** POST /api/auth/login/worker */
    @PostMapping("/login/worker")
    public ResponseEntity<AuthResponse> workerLogin(@Valid @RequestBody WorkerLoginRequest request) {
        return ResponseEntity.ok(authService.workerLogin(request));
    }

    // ─── Forgot Password (3-Step OTP Flow) ───────────────────────────────────

    /**
     * Step 1 — Request OTP
     * POST /api/auth/forgot-password
     * Body: { "email": "user@example.com" }
     *
     * Sends a 6-digit OTP to the email. Always returns success to prevent
     * user-enumeration attacks.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(otpService.forgotPassword(request));
    }

    /**
     * Step 2 — Verify OTP
     * POST /api/auth/verify-otp
     * Body: { "email": "user@example.com", "otp": "123456" }
     *
     * Returns a short-lived resetToken (valid 15 min) on success.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<VerifyOtpResponse> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(otpService.verifyOtp(request));
    }

    /**
     * Step 3 — Reset Password
     * POST /api/auth/reset-password
     * Body: { "resetToken": "...", "newPassword": "...", "confirmPassword": "..." }
     *
     * Validates the resetToken, updates the password, and invalidates all OTP fields.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(otpService.resetPassword(request));
    }



    /** POST /api/auth/google */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(
            @RequestBody OAuth2GoogleRequest request) {
        return ResponseEntity.ok(oAuth2Service.loginWithGoogle(request));
    }
}