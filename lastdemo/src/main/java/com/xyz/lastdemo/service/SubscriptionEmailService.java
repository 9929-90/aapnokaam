package com.xyz.lastdemo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

/**
 * Dedicated email service for newsletter subscription lifecycle emails.
 * Keeps subscription concerns separate from auth concerns.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SubscriptionEmailService {

    private final JavaMailSender mailSender;

    private static final String BASE_URL = "http://localhost:8081/api";

    // ── Confirmation ───────────────────────────────────────────────────────────

    public void sendSubscriptionConfirmationEmail(String toEmail, String unsubscribeToken) {
        String unsubscribeLink = BASE_URL + "/subscribe/unsubscribe?token=" + unsubscribeToken;

        String html = """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><title>Subscribed - AapnoKaam</title></head>
            <body style="font-family:Arial,Helvetica,sans-serif;background:#f0ebe0;margin:0;padding:0;">
              <table width="100%%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:48px 16px;">
                  <table width="560" cellpadding="0" cellspacing="0"
                         style="background:#ede7d9;border:1px solid rgba(20,10,80,0.15);
                                border-radius:4px;overflow:hidden;">

                    <!-- Top bar -->
                    <tr><td style="background:#1a1050;padding:28px 36px;text-align:center;">
                      <h1 style="color:#f0ebe0;font-size:1.7rem;font-weight:700;
                                 letter-spacing:0.02em;margin:0;">
                        aapno<span style="color:rgba(240,235,224,0.45);">kaam</span>
                      </h1>
                      <p style="color:rgba(240,235,224,0.6);font-size:0.7rem;font-weight:600;
                                letter-spacing:0.08em;text-transform:uppercase;margin:6px 0 0;">
                        Stay in the Loop
                      </p>
                    </td></tr>

                    <!-- Body -->
                    <tr><td style="padding:36px 36px 28px;">
                      <p style="color:#1a1050;font-size:0.9rem;font-weight:700;
                                letter-spacing:0.04em;text-transform:uppercase;
                                margin:0 0 16px;opacity:0.55;">
                        You're In!
                      </p>
                      <h2 style="color:#140c40;font-size:1.4rem;font-weight:700;
                                 margin:0 0 14px;line-height:1.35;">
                        Thanks for subscribing to AapnoKaam updates
                      </h2>
                      <p style="color:rgba(20,10,80,0.65);font-size:0.95rem;
                                line-height:1.75;margin:0 0 24px;">
                        You'll be the first to know about new features, platform updates,
                        worker spotlights, and exclusive opportunities on the HyperSkill platform.
                      </p>

                      <!-- What to expect box -->
                      <table width="100%%" cellpadding="0" cellspacing="0"
                             style="background:rgba(20,10,80,0.05);
                                    border-left:3px solid #1a1050;
                                    border-radius:2px;margin-bottom:28px;">
                        <tr><td style="padding:16px 18px;">
                          <p style="color:#1a1050;font-size:0.72rem;font-weight:700;
                                    letter-spacing:0.06em;text-transform:uppercase;margin:0 0 8px;">
                            What to Expect
                          </p>
                          <p style="color:rgba(20,10,80,0.7);font-size:0.88rem;
                                    line-height:1.7;margin:0;">
                            ✦ Platform updates &amp; new features<br/>
                            ✦ Worker success stories<br/>
                            ✦ Tips for consumers &amp; workers<br/>
                            ✦ Exclusive early-access announcements
                          </p>
                        </td></tr>
                      </table>

                      <p style="color:rgba(20,10,80,0.5);font-size:0.78rem;margin:0;line-height:1.65;">
                        Changed your mind? You can
                        <a href="%s" style="color:#1a1050;font-weight:700;">unsubscribe anytime</a>
                        — no hard feelings.
                      </p>
                    </td></tr>

                    <!-- Footer -->
                    <tr><td style="padding:16px 36px 24px;border-top:1px solid rgba(20,10,80,0.1);
                                   text-align:center;">
                      <p style="color:rgba(20,10,80,0.38);font-size:0.72rem;
                                font-weight:600;letter-spacing:0.04em;margin:0;">
                        © 2026 AapnoKaam · HyperSkill Local Workers Platform
                      </p>
                    </td></tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(unsubscribeLink);

        sendHtml(toEmail, "You're subscribed to AapnoKaam updates!", html);
    }

    // ── Welcome Back (re-subscribe) ────────────────────────────────────────────

    public void sendWelcomeBackEmail(String toEmail, String unsubscribeToken) {
        String unsubscribeLink = BASE_URL + "/subscribe/unsubscribe?token=" + unsubscribeToken;

        String html = """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><title>Welcome Back - AapnoKaam</title></head>
            <body style="font-family:Arial,Helvetica,sans-serif;background:#f0ebe0;margin:0;padding:0;">
              <table width="100%%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:48px 16px;">
                  <table width="560" cellpadding="0" cellspacing="0"
                         style="background:#ede7d9;border:1px solid rgba(20,10,80,0.15);border-radius:4px;">
                    <tr><td style="background:#1a1050;padding:28px 36px;text-align:center;">
                      <h1 style="color:#f0ebe0;font-size:1.7rem;font-weight:700;letter-spacing:0.02em;margin:0;">
                        aapno<span style="color:rgba(240,235,224,0.45);">kaam</span>
                      </h1>
                    </td></tr>
                    <tr><td style="padding:36px;">
                      <h2 style="color:#140c40;font-size:1.3rem;font-weight:700;margin:0 0 12px;">
                        Welcome back! 🎉
                      </h2>
                      <p style="color:rgba(20,10,80,0.65);font-size:0.95rem;line-height:1.75;margin:0 0 20px;">
                        You've successfully re-subscribed to AapnoKaam updates.
                        We're glad to have you back — great things are coming!
                      </p>
                      <p style="color:rgba(20,10,80,0.5);font-size:0.78rem;margin:0;">
                        <a href="%s" style="color:#1a1050;font-weight:700;">Unsubscribe</a> anytime.
                      </p>
                    </td></tr>
                    <tr><td style="padding:16px 36px 24px;border-top:1px solid rgba(20,10,80,0.1);text-align:center;">
                      <p style="color:rgba(20,10,80,0.38);font-size:0.72rem;font-weight:600;letter-spacing:0.04em;margin:0;">
                        © 2026 AapnoKaam · HyperSkill Local Workers Platform
                      </p>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(unsubscribeLink);

        sendHtml(toEmail, "You're back! AapnoKaam subscription confirmed", html);
    }

    // ── Unsubscribe Confirmation ───────────────────────────────────────────────

    public void sendUnsubscribeConfirmationEmail(String toEmail) {
        String html = """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><title>Unsubscribed - AapnoKaam</title></head>
            <body style="font-family:Arial,Helvetica,sans-serif;background:#f0ebe0;margin:0;padding:0;">
              <table width="100%%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:48px 16px;">
                  <table width="560" cellpadding="0" cellspacing="0"
                         style="background:#ede7d9;border:1px solid rgba(20,10,80,0.15);border-radius:4px;">
                    <tr><td style="background:#1a1050;padding:28px 36px;text-align:center;">
                      <h1 style="color:#f0ebe0;font-size:1.7rem;font-weight:700;letter-spacing:0.02em;margin:0;">
                        aapno<span style="color:rgba(240,235,224,0.45);">kaam</span>
                      </h1>
                    </td></tr>
                    <tr><td style="padding:36px;">
                      <h2 style="color:#140c40;font-size:1.3rem;font-weight:700;margin:0 0 12px;">
                        You've been unsubscribed
                      </h2>
                      <p style="color:rgba(20,10,80,0.65);font-size:0.95rem;line-height:1.75;margin:0 0 16px;">
                        We've removed <strong>%s</strong> from our mailing list.
                        You won't receive any further emails from us.
                      </p>
                      <p style="color:rgba(20,10,80,0.55);font-size:0.88rem;line-height:1.7;margin:0;">
                        If this was a mistake, you can always re-subscribe from the AapnoKaam website.
                        We'd love to have you back!
                      </p>
                    </td></tr>
                    <tr><td style="padding:16px 36px 24px;border-top:1px solid rgba(20,10,80,0.1);text-align:center;">
                      <p style="color:rgba(20,10,80,0.38);font-size:0.72rem;font-weight:600;letter-spacing:0.04em;margin:0;">
                        © 2026 AapnoKaam · HyperSkill Local Workers Platform
                      </p>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(toEmail);

        sendHtml(toEmail, "You've been unsubscribed from AapnoKaam", html);
    }

    // ── Internal helper ────────────────────────────────────────────────────────

    private void sendHtml(String toEmail, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Subscription email sent → [{}] to {}", subject, toEmail);
        } catch (Exception e) {
            log.error("Failed to send subscription email to {}: {}", toEmail, e.getMessage());
        }
    }
}