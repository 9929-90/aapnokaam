package com.xyz.lastdemo.controller;

import com.xyz.lastdemo.dto.MessageResponse;
import com.xyz.lastdemo.dto.SubscribeRequest;
import com.xyz.lastdemo.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Public endpoints for newsletter subscription management.
 *
 *  POST   /api/subscribe              — subscribe with email
 *  GET    /api/subscribe/unsubscribe  — one-click unsubscribe via token link
 *  GET    /api/subscribe/count        — active subscriber count (admin use)
 */
@RestController
@RequestMapping("/api/subscribe")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    /**
     * Subscribe an email address.
     * POST /api/subscribe
     * Body: { "email": "user@example.com" }
     */
    @PostMapping
    public ResponseEntity<MessageResponse> subscribe(
            @Valid @RequestBody SubscribeRequest request) {
        return ResponseEntity.ok(subscriptionService.subscribe(request));
    }

    /**
     * One-click unsubscribe via token embedded in emails.
     * GET /api/subscribe/unsubscribe?token=<uuid>
     *
     * Returns a plain HTML response so clicking the link in an email
     * shows a human-readable confirmation page directly in the browser.
     */
    @GetMapping("/unsubscribe")
    public ResponseEntity<String> unsubscribe(@RequestParam String token) {
        MessageResponse result = subscriptionService.unsubscribe(token);

        String html = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>%s - AapnoKaam</title>
              <style>
                body { font-family: Arial, sans-serif; background: #f0ebe0;
                       display: flex; align-items: center; justify-content: center;
                       min-height: 100vh; margin: 0; }
                .card { background: #ede7d9; border: 1px solid rgba(20,10,80,0.2);
                        border-radius: 4px; padding: 48px 40px; max-width: 440px;
                        text-align: center; }
                h1 { color: #1a1050; font-size: 1.6rem; margin: 0 0 8px; }
                p  { color: rgba(20,10,80,0.65); font-size: 0.95rem; line-height: 1.7; }
                a  { color: #1a1050; font-weight: 700; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>aapno<span style="color:rgba(26,16,80,0.4);">kaam</span></h1>
                <p style="margin:6px 0 24px;font-size:0.78rem;color:rgba(20,10,80,0.45);
                           text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">
                  Subscription Update
                </p>
                <p>%s</p>
                <p style="margin-top:24px;font-size:0.8rem;">
                  <a href="http://localhost:5173">Return to AapnoKaam</a>
                </p>
              </div>
            </body>
            </html>
            """.formatted(
                result.isSuccess() ? "Unsubscribed" : "Error",
                result.getMessage()
        );

        return ResponseEntity.ok()
                .header("Content-Type", "text/html;charset=UTF-8")
                .body(html);
    }

    /**
     * Returns the count of active subscribers.
     * GET /api/subscribe/count
     * Secured in production — add @PreAuthorize("hasRole('ADMIN')") as needed.
     */
    @GetMapping("/count")
    public ResponseEntity<MessageResponse> count() {
        long count = subscriptionService.getActiveSubscriberCount();
        return ResponseEntity.ok(MessageResponse.builder()
                .message(count + " active subscribers")
                .success(true)
                .build());
    }
}