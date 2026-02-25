package com.xyz.lastdemo.controller;

import com.xyz.lastdemo.dto.ContactRequest;
import com.xyz.lastdemo.dto.ContactResponse;
import com.xyz.lastdemo.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Public endpoint for the AapnoKaam website contact form.
 * No authentication required.
 *
 * POST /api/contact
 */
@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")   // tighten this to your frontend URL in production
public class ContactController {

    private final ContactService contactService;

    /**
     * Accepts a contact form submission, sends emails, and returns a confirmation.
     *
     * Request body (JSON):
     * {
     *   "name":    "John Doe",
     *   "email":   "john@example.com",
     *   "message": "Hello, I have a question..."
     * }
     */
    @PostMapping
    public ResponseEntity<ContactResponse> submitContactForm(
            @Valid @RequestBody ContactRequest request) {

        try {
            contactService.processContactForm(request);
            return ResponseEntity.ok(
                    new ContactResponse(true, "Your message has been sent! We'll get back to you within 1–2 business days.")
            );
        } catch (Exception e) {
            log.error("Contact form submission failed: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(new ContactResponse(false, "Something went wrong. Please try again or email us directly at support@aapnokaam.in"));
        }
    }
}