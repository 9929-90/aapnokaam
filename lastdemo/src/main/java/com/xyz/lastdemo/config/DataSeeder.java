package com.xyz.lastdemo.config;

import com.xyz.lastdemo.entity.User;
import com.xyz.lastdemo.entity.UserRole;
import com.xyz.lastdemo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Data seeder to auto-create admin user on startup
 * Runs only once on application initialization
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        seedAdmin();
    }

    private void seedAdmin() {
        // Check if admin already exists
        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Admin user already exists: {}", adminEmail);
            return;
        }

        // Create admin user
        User admin = User.builder()
                .username("admin")
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(UserRole.ADMIN)
                .emailVerified(true) // Admin doesn't need email verification
                .workerApproved(false)
                .enabled(true)
                .build();

        userRepository.save(admin);

        log.info("========================================");
        log.info("ADMIN USER CREATED");
        log.info("Email: {}", adminEmail);
        log.info("Password: {}", adminPassword);
        log.info("========================================");
        log.info("IMPORTANT: Change the admin password in production!");
        log.info("========================================");
    }
}