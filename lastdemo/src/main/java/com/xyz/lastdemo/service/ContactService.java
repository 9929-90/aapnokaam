package com.xyz.lastdemo.service;

import com.xyz.lastdemo.dto.ContactRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Handles contact form logic:
 *  1. Sends a notification email to the admin with the user's message.
 *  2. Sends a confirmation/acknowledgement email to the user.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ContactService {

    private final EmailService emailService;

    /**
     * Admin inbox — set in application.properties:
     *   app.contact.admin-email=support@aapnokaam.in
     */
    @Value("${app.contact.admin-email:rohitsuthar410@gmail.com}")
    private String adminEmail;

    /**
     * Processes a contact form submission.
     * Throws RuntimeException if either email fails (caller should handle gracefully).
     */
    public void processContactForm(ContactRequest req) {
        log.info("Contact form submission from {} <{}>", req.getName(), req.getEmail());

        // 1. Notify admin
        emailService.sendContactNotificationEmail(adminEmail, req.getName(), req.getEmail(), req.getMessage());

        // 2. Acknowledge to user
        emailService.sendContactAcknowledgementEmail(req.getEmail(), req.getName());
    }
}