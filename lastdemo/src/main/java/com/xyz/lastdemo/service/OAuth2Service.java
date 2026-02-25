package com.xyz.lastdemo.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.xyz.lastdemo.dto.AuthResponse;
import com.xyz.lastdemo.dto.OAuth2GoogleRequest;
import com.xyz.lastdemo.entity.User;
import com.xyz.lastdemo.entity.UserRole;
import com.xyz.lastdemo.repository.UserRepository;
import com.xyz.lastdemo.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2Service {

    private final UserRepository userRepository;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final ConsumerService consumerService;

    @Transactional
    public AuthResponse loginWithGoogle(OAuth2GoogleRequest request) {

        // 1. Verify the Google ID token
        GoogleIdToken.Payload payload = googleTokenVerifier.verify(request.getToken());

        String googleId = payload.getSubject();
        String email    = payload.getEmail();
        String name     = (String) payload.get("name");
        String picture  = (String) payload.get("picture");

        // 2. Check if user already exists by googleId or email
        Optional<User> existingByGoogleId = userRepository.findByGoogleId(googleId);
        Optional<User> existingByEmail    = userRepository.findByEmail(email);

        User user;

        if (existingByGoogleId.isPresent()) {
            // Returning Google user — just log in
            user = existingByGoogleId.get();
            log.info("Google OAuth2 login: existing user {}", email);

        } else if (existingByEmail.isPresent()) {
            // Email exists but no googleId yet — link accounts
            user = existingByEmail.get();
            user.setGoogleId(googleId);
            user.setAuthProvider("GOOGLE");
            user.setEmailVerified(true); // Google emails are verified
            userRepository.save(user);
            log.info("Google OAuth2 login: linked existing account {}", email);

        } else {
            // New user — auto-register
            UserRole role = parseRole(request.getRole());
            String username = generateUsername(email);

            user = User.builder()
                    .email(email)
                    .name(name != null ? name : email)
                    .username(username)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // random unusable password
                    .role(role)
                    .googleId(googleId)
                    .authProvider("GOOGLE")
                    .emailVerified(true) // Google emails are pre-verified
                    .workerApproved(false)
                    .build();

            userRepository.save(user);

            // Auto-create consumer profile if CONSUMER role
            if (role == UserRole.CONSUMER) {
                consumerService.ensureConsumerProfile(user.getId(), name);
            }

            log.info("Google OAuth2 login: new user registered {} as {}", email, role);
        }

        // 3. Check login eligibility
        if (!user.canLogin()) {
            if (user.getRole() == UserRole.WORKER && !user.isWorkerApproved()) {
                throw new RuntimeException("Your worker account is pending admin approval.");
            }
            throw new RuntimeException("Account is not active. Please contact support.");
        }

        // 4. Issue JWT
        String jwt = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwt)
                .email(user.getEmail())
                .username(user.getName())
                .role(user.getRole().name())
                .userId(user.getId())
                .message("Google login successful!")
                .success(true)
                .build();
    }

    private UserRole parseRole(String role) {
        if (role == null) return UserRole.CONSUMER; // default
        return switch (role.toUpperCase()) {
            case "WORKER" -> UserRole.WORKER;
            default       -> UserRole.CONSUMER;
        };
    }

    private String generateUsername(String email) {
        String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + suffix++;
        }
        return candidate;
    }
}