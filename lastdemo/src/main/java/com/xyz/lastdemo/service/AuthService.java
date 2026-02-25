package com.xyz.lastdemo.service;

import com.xyz.lastdemo.entity.User;
import com.xyz.lastdemo.entity.UserRole;
import com.xyz.lastdemo.entity.WorkerProfile;
import com.xyz.lastdemo.exception.AuthException;
import com.xyz.lastdemo.repository.UserRepository;
import com.xyz.lastdemo.repository.WorkerProfileRepository;
import com.xyz.lastdemo.security.JwtService;
import com.xyz.lastdemo.util.PanEncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.xyz.lastdemo.dto.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Authentication service handling registration, login, and verification
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;
    private final WorkerProfileRepository workerProfileRepository;

    /**
     * Register new consumer
     */
    @Transactional
    public MessageResponse registerConsumer(ConsumerRegistrationRequest request) {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new AuthException("Passwords do not match");
        }

        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("Email already registered");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AuthException("Username already taken");
        }

        // Create user
        String verificationToken = emailService.generateVerificationToken();

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.CONSUMER)
                .emailVerified(false)
                .emailVerificationToken(verificationToken)
                .emailVerificationTokenExpiry(LocalDateTime.now().plusHours(24))
                .workerApproved(false)
                .build();

        userRepository.save(user);

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), verificationToken);

        log.info("Consumer registered: {}", user.getEmail());

        return MessageResponse.builder()
                .message("Registration successful! Please check your email to verify your account.")
                .success(true)
                .build();
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("No account found with this email"));

        if (user.isEmailVerified()) {
            throw new AuthException("Email is already verified");
        }

        // Optional: check if previous token is still valid → maybe don't resend too frequently
        // e.g. if (user.getEmailVerificationTokenExpiry().isAfter(LocalDateTime.now().minusMinutes(5))) { ... }

        String newToken = emailService.generateVerificationToken();

        user.setEmailVerificationToken(newToken);
        user.setEmailVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        emailService.sendVerificationEmail(email, newToken);

        log.info("Verification email resent to: {}", email);
    }


    /**
     * Register new worker
     */
    @Transactional
    public MessageResponse registerWorker(WorkerRegistrationRequest request) {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new AuthException("Passwords do not match");
        }

        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("Email already registered");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AuthException("Username already taken");
        }

        // Create worker
        String verificationToken = emailService.generateVerificationToken();

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.WORKER)
                .emailVerified(false)
                .emailVerificationToken(verificationToken)
                .emailVerificationTokenExpiry(LocalDateTime.now().plusHours(24))
                .panNumber(PanEncryptionUtil.encrypt(request.getPanNumber()))
                .workerApproved(false)
                .build();

        userRepository.save(user);

        // **ADD THIS: Create worker profile**
        WorkerProfile workerProfile = WorkerProfile.builder()
                .user(user)
                .fullName(request.getUsername())  // or request.getFullName() if available
                .isAvailable(false)
                .isVerified(false)
                .averageRating(BigDecimal.ZERO)
                .totalReviews(0)
                .totalJobsCompleted(0)
                .build();

        workerProfileRepository.save(workerProfile);

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), verificationToken);

        log.info("Worker registered with profile: {} (awaiting approval)", user.getEmail());

        return MessageResponse.builder()
                .message("Registration successful! Please verify your email. Your account will be activated after admin approval.")
                .success(true)
                .build();
    }

    /**
     * Verify email with token
     */
    @Transactional
    public MessageResponse verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new AuthException("Invalid verification token"));

        // Check token expiry
        if (user.getEmailVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new AuthException("Verification token has expired");
        }

        // Mark as verified
        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);
        userRepository.save(user);

        log.info("Email verified for user: {}", user.getEmail());

        String message = user.getRole() == UserRole.WORKER
                ? "Email verified! Your account is pending admin approval."
                : "Email verified! You can now login.";

        return MessageResponse.builder()
                .message(message)
                .success(true)
                .build();
    }

    /**
     * Login (Admin and Consumer)
     */
    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("User not found"));

        // Check if user can login
        if (!user.canLogin()) {
            if (!user.isEmailVerified()) {
                throw new AuthException("Please verify your email before logging in");
            }
            if (user.getRole() == UserRole.WORKER && !user.isWorkerApproved()) {
                throw new AuthException("Your worker account is pending admin approval");
            }
            throw new AuthException("Account is not active");
        }

        // Generate JWT token
        String jwtToken = jwtService.generateToken(user);

        log.info("User logged in: {} (Role: {})", user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(jwtToken)
                .message("Login successful")
                .role(user.getRole().name())
                .userId(user.getId())
                .username(user.getUsername())
                .build();
    }

    /**
     * Worker login (using worker ID)
     */
    public AuthResponse workerLogin(WorkerLoginRequest request) {
        User user = userRepository.findById(request.getWorkerId())
                .orElseThrow(() -> new AuthException("Invalid worker ID"));

        // Authenticate
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getEmail(),
                        request.getPassword()
                )
        );

        // Check if worker can login
        if (!user.canLogin()) {
            if (!user.isEmailVerified()) {
                throw new AuthException("Please verify your email before logging in");
            }
            if (!user.isWorkerApproved()) {
                throw new AuthException("Your worker account is pending admin approval");
            }
            throw new AuthException("Account is not active");
        }

        // Generate JWT token
        String jwtToken = jwtService.generateToken(user);

        log.info("Worker logged in: ID {} ({})", user.getId(), user.getEmail());

        return AuthResponse.builder()
                .token(jwtToken)
                .message("Worker login successful")
                .role(user.getRole().name())
                .userId(user.getId())
                .username(user.getUsername())
                .build();
    }

    /**
     * Get pending workers for admin approval
     */
    public List<PendingWorkerDTO> getPendingWorkers() {
        List<User> pendingWorkers = userRepository.findByRoleAndWorkerApprovedFalse(UserRole.WORKER);

        return pendingWorkers.stream()
                .map(worker -> PendingWorkerDTO.builder()
                        .id(worker.getId())
                        .username(worker.getUsername())
                        .email(worker.getEmail())
                        .panNumber(PanEncryptionUtil.maskPan(worker.getPanNumber()))
                        .createdAt(worker.getCreatedAt().toString())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Approve or reject worker
     */
    @Transactional
    public MessageResponse approveWorker(Long workerId, boolean approved) {
        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new AuthException("Worker not found"));

        if (worker.getRole() != UserRole.WORKER) {
            throw new AuthException("User is not a worker");
        }

        worker.setWorkerApproved(approved);
        userRepository.save(worker);

        // **ADD THIS: Update worker profile verification status**
        if (approved) {
            workerProfileRepository.findByUserId(workerId)
                    .ifPresent(profile -> {
                        profile.setIsVerified(true);
                        workerProfileRepository.save(profile);
                    });
        }

        // Send notification email
        emailService.sendWorkerApprovalEmail(worker.getEmail(), worker.getUsername(), approved);

        log.info("Worker {} {}: {}", workerId, approved ? "approved" : "rejected", worker.getEmail());

        return MessageResponse.builder()
                .message("Worker " + (approved ? "approved" : "rejected") + " successfully")
                .success(true)
                .build();
    }
}