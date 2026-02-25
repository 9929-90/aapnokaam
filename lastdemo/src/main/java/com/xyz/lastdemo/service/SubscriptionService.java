package com.xyz.lastdemo.service;

import com.xyz.lastdemo.dto.MessageResponse;
import com.xyz.lastdemo.dto.SubscribeRequest;
import com.xyz.lastdemo.entity.EmailSubscription;
import com.xyz.lastdemo.repository.EmailSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class SubscriptionService {

    private final EmailSubscriptionRepository subscriptionRepository;
    private final SubscriptionEmailService    subscriptionEmailService;

    // ── Subscribe ──────────────────────────────────────────────────────────────

    @Transactional
    public MessageResponse subscribe(SubscribeRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        // Case 1: Already active subscriber
        if (subscriptionRepository.existsByEmailAndActiveTrue(email)) {
            return MessageResponse.builder()
                    .message("You're already subscribed! We'll keep you posted.")
                    .success(true)
                    .build();
        }

        // Case 2: Previously unsubscribed — reactivate
        var existing = subscriptionRepository.findByEmail(email);
        if (existing.isPresent()) {
            EmailSubscription sub = existing.get();
            sub.setActive(true);
            sub.setUnsubscribedAt(null);
            sub.setUnsubscribeToken(UUID.randomUUID().toString());
            subscriptionRepository.save(sub);
            subscriptionEmailService.sendWelcomeBackEmail(email, sub.getUnsubscribeToken());
            log.info("Re-subscribed: {}", email);
            return MessageResponse.builder()
                    .message("Welcome back! You've been re-subscribed successfully.")
                    .success(true)
                    .build();
        }

        // Case 3: Brand new subscriber
        String token = UUID.randomUUID().toString();
        EmailSubscription sub = EmailSubscription.builder()
                .email(email)
                .unsubscribeToken(token)
                .active(true)
                .build();
        subscriptionRepository.save(sub);
        subscriptionEmailService.sendSubscriptionConfirmationEmail(email, token);
        log.info("New subscriber: {}", email);

        return MessageResponse.builder()
                .message("You're subscribed! Check your email for a confirmation.")
                .success(true)
                .build();
    }

    // ── Unsubscribe ────────────────────────────────────────────────────────────

    @Transactional
    public MessageResponse unsubscribe(String token) {
        EmailSubscription sub = subscriptionRepository.findByUnsubscribeToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid unsubscribe token"));

        if (!sub.isActive()) {
            return MessageResponse.builder()
                    .message("This email is already unsubscribed.")
                    .success(true)
                    .build();
        }

        sub.setActive(false);
        sub.setUnsubscribedAt(LocalDateTime.now());
        subscriptionRepository.save(sub);

        subscriptionEmailService.sendUnsubscribeConfirmationEmail(sub.getEmail());
        log.info("Unsubscribed: {}", sub.getEmail());

        return MessageResponse.builder()
                .message("You've been successfully unsubscribed. Sorry to see you go!")
                .success(true)
                .build();
    }

    // ── Admin: subscriber count ────────────────────────────────────────────────

    public long getActiveSubscriberCount() {
        return subscriptionRepository.findByActiveTrue().size();
    }
}