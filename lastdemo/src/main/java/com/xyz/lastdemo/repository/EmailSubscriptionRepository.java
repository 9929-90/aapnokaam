package com.xyz.lastdemo.repository;

import com.xyz.lastdemo.entity.EmailSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmailSubscriptionRepository extends JpaRepository<EmailSubscription, Long> {

    Optional<EmailSubscription> findByEmail(String email);

    Optional<EmailSubscription> findByUnsubscribeToken(String token);

    boolean existsByEmailAndActiveTrue(String email);

    /** Used by admin endpoints to fetch all active subscribers. */
    List<EmailSubscription> findByActiveTrue();
}