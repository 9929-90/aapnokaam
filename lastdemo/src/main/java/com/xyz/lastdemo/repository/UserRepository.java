package com.xyz.lastdemo.repository;

import com.xyz.lastdemo.entity.User;
import com.xyz.lastdemo.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for User entity with custom query methods.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmailVerificationToken(String token);

    boolean existsByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    boolean existsByUsername(String username);

    // Worker-specific queries
    List<User> findByRoleAndWorkerApprovedFalse(UserRole role);

    List<User> findByRole(UserRole role);

    // ─── Password Reset ───────────────────────────────────────────────────────

    /**
     * Looks up a user by their hashed password-reset token.
     * Used in step 3 of the forgot-password flow.
     */
    Optional<User> findByPasswordResetToken(String hashedToken);
}