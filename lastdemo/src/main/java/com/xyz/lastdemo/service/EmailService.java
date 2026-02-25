package com.xyz.lastdemo.service;

import com.xyz.lastdemo.entity.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

import java.util.UUID;

/**
 * Email service for sending transactional emails via SMTP (Gmail).
 * Covers: email verification, OTP password reset, worker approval.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // ─── Token / OTP Generation ───────────────────────────────────────────────

    /**
     * Generate a UUID-based email verification token.
     */
    public String generateVerificationToken() {
        return UUID.randomUUID().toString();
    }

    // ─── Email Verification ───────────────────────────────────────────────────

    /**
     * Sends a clickable email-verification link.
     */
    public void sendVerificationEmail(String toEmail, String token) {
        String verificationLink = "http://localhost:8081/api/auth/verify-email?token=" + token;

        String htmlBody = """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><title>Email Verification - AapnoKaam</title></head>
            <body style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;margin:0;padding:0;">
              <table width="100%%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:40px 0;">
                  <table width="600" cellpadding="0" cellspacing="0"
                         style="background:#ffffff;border-radius:8px;padding:30px;">
                    <tr><td align="center" style="padding-bottom:20px;">
                      <h1 style="color:#2c3e50;margin:0;">AapnoKaam</h1>
                      <p style="color:#7f8c8d;margin:5px 0 0;">HyperSkill Local Workers Platform</p>
                    </td></tr>
                    <tr><td style="color:#2c3e50;font-size:15px;line-height:1.6;">
                      <p>Dear User,</p>
                      <p>Thank you for registering with <strong>AapnoKaam</strong>.
                         Please verify your email address by clicking the button below.</p>
                      <p style="text-align:center;margin:30px 0;">
                        <a href="%s"
                           style="background:#1abc9c;color:#fff;padding:14px 28px;
                                  text-decoration:none;font-weight:bold;border-radius:6px;
                                  display:inline-block;">
                          Verify Email Now
                        </a>
                      </p>
                      <p style="font-size:13px;color:#7f8c8d;">
                        This link expires in <strong>24 hours</strong>.
                        If you did not create this account, you can safely ignore this email.
                      </p>
                      <p style="margin-top:30px;">Regards,<br><strong>AapnoKaam Team</strong></p>
                    </td></tr>
                    <tr><td align="center" style="padding-top:20px;font-size:12px;color:#95a5a6;">
                      © 2026 AapnoKaam. All rights reserved.
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(verificationLink);

        sendHtmlEmail(toEmail, "Email Verification - AapnoKaam", htmlBody);
    }

    // ─── OTP Password Reset ───────────────────────────────────────────────────

    /**
     * Sends a 6-digit OTP for password reset.
     * The OTP is displayed prominently with a 10-minute expiry notice.
     */
    public void sendOtpEmail(String toEmail, String otp) {
        String htmlBody = """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><title>Password Reset OTP - AapnoKaam</title></head>
            <body style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;margin:0;padding:0;">
              <table width="100%%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:40px 0;">
                  <table width="600" cellpadding="0" cellspacing="0"
                         style="background:#ffffff;border-radius:8px;padding:30px;">

                    <!-- Header -->
                    <tr><td align="center" style="padding-bottom:20px;border-bottom:2px solid #f0f0f0;">
                      <h1 style="color:#2c3e50;margin:0;">AapnoKaam</h1>
                      <p style="color:#7f8c8d;margin:5px 0 0;">HyperSkill Local Workers Platform</p>
                    </td></tr>

                    <!-- Body -->
                    <tr><td style="color:#2c3e50;font-size:15px;line-height:1.7;padding-top:24px;">
                      <p>Dear User,</p>
                      <p>We received a request to reset the password for your <strong>AapnoKaam</strong> account.
                         Use the OTP below to proceed. <strong>Do not share it with anyone.</strong></p>

                      <!-- OTP Box -->
                      <table width="100%%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                        <tr><td align="center">
                          <div style="display:inline-block;background:#f8f9fa;border:2px dashed #1abc9c;
                                      border-radius:10px;padding:20px 40px;">
                            <p style="margin:0;font-size:13px;color:#7f8c8d;letter-spacing:1px;">
                              YOUR ONE-TIME PASSWORD
                            </p>
                            <p style="margin:8px 0 0;font-size:42px;font-weight:bold;
                                       letter-spacing:12px;color:#1abc9c;">
                              %s
                            </p>
                          </div>
                        </td></tr>
                      </table>

                      <!-- Expiry notice -->
                      <table width="100%%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#fff8e1;border-left:4px solid #f39c12;
                                     border-radius:4px;padding:12px 16px;font-size:13px;color:#856404;">
                            ⏱ This OTP is valid for <strong>10 minutes only</strong>.
                            After that, you will need to request a new one.
                          </td>
                        </tr>
                      </table>

                      <p style="margin-top:24px;font-size:13px;color:#7f8c8d;">
                        If you did not request a password reset, please ignore this email.
                        Your account remains secure.
                      </p>
                      <p style="margin-top:30px;">Regards,<br><strong>AapnoKaam Team</strong></p>
                    </td></tr>

                    <!-- Footer -->
                    <tr><td align="center" style="padding-top:20px;border-top:1px solid #f0f0f0;
                                                   font-size:12px;color:#95a5a6;margin-top:20px;">
                      © 2026 AapnoKaam. All rights reserved.
                    </td></tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(otp);

        sendHtmlEmail(toEmail, "Your Password Reset OTP - AapnoKaam", htmlBody);
        log.info("OTP email sent to: {}", toEmail);
    }

    // ─── Worker Approval ──────────────────────────────────────────────────────

    /**
     * Sends an HTML approval / rejection email to the worker.
     */
    public void sendWorkerApprovalEmail(String toEmail, String username, boolean approved) {
        String subject;
        String htmlBody;

        if (approved) {
            subject = "🎉 Your Worker Account Has Been Approved - AapnoKaam";
            htmlBody = """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"><title>Account Approved - AapnoKaam</title></head>
                <body style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;margin:0;padding:0;">
                  <table width="100%%" cellpadding="0" cellspacing="0">
                    <tr><td align="center" style="padding:40px 0;">
                      <table width="600" cellpadding="0" cellspacing="0"
                             style="background:#fff;border-radius:8px;padding:30px;">
                        <tr><td align="center" style="padding-bottom:20px;">
                          <h1 style="color:#2c3e50;margin:0;">AapnoKaam</h1>
                        </td></tr>
                        <tr><td style="color:#2c3e50;font-size:15px;line-height:1.7;">
                          <p>Dear <strong>%s</strong>,</p>
                          <p>🎉 Congratulations! Your worker account has been <strong style="color:#1abc9c;">approved</strong>
                             by our admin team.</p>
                          <p>You can now log in and start accepting jobs on the platform.</p>
                          <p style="margin-top:30px;">Regards,<br><strong>AapnoKaam Team</strong></p>
                        </td></tr>
                        <tr><td align="center" style="padding-top:20px;font-size:12px;color:#95a5a6;">
                          © 2026 AapnoKaam. All rights reserved.
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(username);
        } else {
            subject = "Your Worker Application Status - AapnoKaam";
            htmlBody = """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"><title>Application Status - AapnoKaam</title></head>
                <body style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;margin:0;padding:0;">
                  <table width="100%%" cellpadding="0" cellspacing="0">
                    <tr><td align="center" style="padding:40px 0;">
                      <table width="600" cellpadding="0" cellspacing="0"
                             style="background:#fff;border-radius:8px;padding:30px;">
                        <tr><td align="center" style="padding-bottom:20px;">
                          <h1 style="color:#2c3e50;margin:0;">AapnoKaam</h1>
                        </td></tr>
                        <tr><td style="color:#2c3e50;font-size:15px;line-height:1.7;">
                          <p>Dear <strong>%s</strong>,</p>
                          <p>We regret to inform you that your worker application has not been approved
                             at this time.</p>
                          <p>If you believe this is a mistake or would like to reapply, please contact
                             our support team.</p>
                          <p style="margin-top:30px;">Regards,<br><strong>AapnoKaam Team</strong></p>
                        </td></tr>
                        <tr><td align="center" style="padding-top:20px;font-size:12px;color:#95a5a6;">
                          © 2026 AapnoKaam. All rights reserved.
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(username);
        }

        sendHtmlEmail(toEmail, subject, htmlBody);
        log.info("Worker approval email ({}) sent to: {}", approved ? "APPROVED" : "REJECTED", toEmail);
    }

    // ─── Internal Helper ──────────────────────────────────────────────────────

    /**
     * Shared SMTP dispatcher. All public methods funnel through here.
     */
    private void sendHtmlEmail(String toEmail, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent → [{}] to {}", subject, toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    // ─── Contact Form ─────────────────────────────────────────────────────────

    /**
     * Sends the user's contact message to the admin inbox.
     */
    public void sendContactNotificationEmail(String adminEmail,
                                             String userName,
                                             String userEmail,
                                             String userMessage) {
        String htmlBody = """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><title>New Contact Message - AapnoKaam</title></head>
            <body style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;margin:0;padding:0;">
              <table width="100%%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:40px 0;">
                  <table width="600" cellpadding="0" cellspacing="0"
                         style="background:#ffffff;border-radius:8px;padding:30px;">

                    <tr><td align="center" style="padding-bottom:20px;border-bottom:2px solid #f0f0f0;">
                      <h1 style="color:#2c3e50;margin:0;">AapnoKaam</h1>
                      <p style="color:#7f8c8d;margin:5px 0 0;">New Contact Form Submission</p>
                    </td></tr>

                    <tr><td style="color:#2c3e50;font-size:15px;line-height:1.7;padding-top:24px;">
                      <p>You have received a new message via the contact form:</p>

                      <table width="100%%" cellpadding="0" cellspacing="0"
                             style="background:#f8f9fa;border-radius:6px;padding:20px;margin:16px 0;">
                        <tr>
                          <td style="font-size:13px;color:#7f8c8d;padding-bottom:6px;">
                            <strong>From:</strong>
                          </td>
                          <td style="font-size:15px;color:#2c3e50;padding-bottom:6px;">
                            %s
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size:13px;color:#7f8c8d;padding-bottom:6px;">
                            <strong>Email:</strong>
                          </td>
                          <td style="font-size:15px;color:#1abc9c;padding-bottom:6px;">
                            <a href="mailto:%s" style="color:#1abc9c;text-decoration:none;">%s</a>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding-top:12px;border-top:1px solid #e0e0e0;">
                            <p style="margin:8px 0 4px;font-size:13px;color:#7f8c8d;"><strong>Message:</strong></p>
                            <p style="margin:0;font-size:15px;color:#2c3e50;line-height:1.7;
                                       white-space:pre-wrap;">%s</p>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size:13px;color:#7f8c8d;">
                        Reply directly to <strong>%s</strong> to respond to this inquiry.
                      </p>
                    </td></tr>

                    <tr><td align="center" style="padding-top:20px;border-top:1px solid #f0f0f0;
                                                   font-size:12px;color:#95a5a6;">
                      © 2026 AapnoKaam. All rights reserved.
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(userName, userEmail, userEmail, userMessage, userEmail);

        sendHtmlEmail(adminEmail, "📩 New Contact Message from " + userName, htmlBody);
        log.info("Contact notification sent to admin for user: {}", userEmail);
    }

    /**
     * Sends a confirmation email to the user who submitted the contact form.
     */
    public void sendContactAcknowledgementEmail(String toEmail, String userName) {
        String htmlBody = """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><title>We Received Your Message - AapnoKaam</title></head>
            <body style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;margin:0;padding:0;">
              <table width="100%%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:40px 0;">
                  <table width="600" cellpadding="0" cellspacing="0"
                         style="background:#ffffff;border-radius:8px;padding:30px;">

                    <tr><td align="center" style="padding-bottom:20px;border-bottom:2px solid #f0f0f0;">
                      <h1 style="color:#2c3e50;margin:0;">AapnoKaam</h1>
                      <p style="color:#7f8c8d;margin:5px 0 0;">HyperSkill Local Workers Platform</p>
                    </td></tr>

                    <tr><td style="color:#2c3e50;font-size:15px;line-height:1.7;padding-top:24px;">
                      <p>Dear <strong>%s</strong>,</p>
                      <p>Thank you for reaching out to us! We have received your message and our team
                         will get back to you within <strong>1–2 business days</strong>.</p>

                      <table width="100%%" cellpadding="0" cellspacing="0"
                             style="background:#f0fdf8;border-left:4px solid #1abc9c;
                                    border-radius:4px;padding:14px 18px;margin:20px 0;">
                        <tr><td style="font-size:14px;color:#2c3e50;">
                          ✅ Your message has been received and logged. We'll respond to your registered
                          email address shortly.
                        </td></tr>
                      </table>

                      <p style="font-size:13px;color:#7f8c8d;">
                        For urgent queries, you can also reach us at
                        <a href="mailto:support@aapnokaam.in" style="color:#1abc9c;text-decoration:none;">
                          support@aapnokaam.in
                        </a>
                        or call us at <strong>+91 1800-123-4567</strong>.
                      </p>
                      <p style="margin-top:30px;">Regards,<br><strong>AapnoKaam Team</strong></p>
                    </td></tr>

                    <tr><td align="center" style="padding-top:20px;border-top:1px solid #f0f0f0;
                                                   font-size:12px;color:#95a5a6;">
                      © 2026 AapnoKaam. All rights reserved.
                    </td></tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(userName);

        sendHtmlEmail(toEmail, "✅ We Received Your Message - AapnoKaam", htmlBody);
        log.info("Contact acknowledgement sent to: {}", toEmail);
    }
    public void sendBookingConfirmationEmail(String toEmail, String name, Booking booking) {
        String htmlBody = """
        <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f4f6f8;">
          <table width="100%%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:40px 0;">
              <table width="600" style="background:#fff;border-radius:8px;padding:30px;">
                <tr><td align="center" style="padding-bottom:20px;">
                  <h1 style="color:#2c3e50;">AapnoKaam</h1>
                </td></tr>
                <tr><td style="color:#2c3e50;font-size:15px;line-height:1.7;">
                  <p>Dear <strong>%s</strong>,</p>
                  <p>✅ Your booking has been <strong style="color:#1abc9c;">confirmed</strong>!</p>
                  <table width="100%%" style="background:#f8f9fa;border-radius:6px;padding:16px;margin:16px 0;">
                    <tr><td><strong>Booking ID:</strong></td><td>#%d</td></tr>
                    <tr><td><strong>Service:</strong></td><td>%s</td></tr>
                    <tr><td><strong>Worker:</strong></td><td>%s</td></tr>
                    <tr><td><strong>Date:</strong></td><td>%s</td></tr>
                    <tr><td><strong>Time:</strong></td><td>%s</td></tr>
                    <tr><td><strong>Duration:</strong></td><td>%d hours</td></tr>
                    <tr><td><strong>Estimated Cost:</strong></td><td>₹%s</td></tr>
                    <tr><td><strong>Address:</strong></td><td>%s, %s</td></tr>
                  </table>
                  <p>The worker will arrive at the scheduled time. You can track your booking in the app.</p>
                  <p>Regards,<br><strong>AapnoKaam Team</strong></p>
                </td></tr>
                <tr><td align="center" style="padding-top:20px;font-size:12px;color:#95a5a6;">
                  © 2026 AapnoKaam. All rights reserved.
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body></html>
        """.formatted(
                name,
                booking.getId(),
                booking.getServiceTitle(),
                booking.getWorker().getFullName(),
                booking.getScheduledDate().toLocalDate(),
                booking.getScheduledTime().toLocalTime(),
                booking.getEstimatedDuration(),
                booking.getEstimatedCost(),
                booking.getAddress(), booking.getCity()
        );

        sendHtmlEmail(toEmail, "✅ Booking Confirmed - AapnoKaam #" + booking.getId(), htmlBody);
        log.info("Booking confirmation email sent to consumer: {}", toEmail);
    }

    public void sendWorkerBookingNotificationEmail(String toEmail, String name, Booking booking) {
        String htmlBody = """
        <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f4f6f8;">
          <table width="100%%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:40px 0;">
              <table width="600" style="background:#fff;border-radius:8px;padding:30px;">
                <tr><td align="center" style="padding-bottom:20px;">
                  <h1 style="color:#2c3e50;">AapnoKaam</h1>
                </td></tr>
                <tr><td style="color:#2c3e50;font-size:15px;line-height:1.7;">
                  <p>Dear <strong>%s</strong>,</p>
                  <p>🎉 You have a new confirmed booking!</p>
                  <table width="100%%" style="background:#f8f9fa;border-radius:6px;padding:16px;margin:16px 0;">
                    <tr><td><strong>Booking ID:</strong></td><td>#%d</td></tr>
                    <tr><td><strong>Service:</strong></td><td>%s</td></tr>
                    <tr><td><strong>Customer:</strong></td><td>%s</td></tr>
                    <tr><td><strong>Date:</strong></td><td>%s</td></tr>
                    <tr><td><strong>Time:</strong></td><td>%s</td></tr>
                    <tr><td><strong>Duration:</strong></td><td>%d hours</td></tr>
                    <tr><td><strong>Earnings:</strong></td><td>₹%s</td></tr>
                    <tr><td><strong>Location:</strong></td><td>%s, %s</td></tr>
                  </table>
                  <p>Please be on time. You can view full details in your worker dashboard.</p>
                  <p>Regards,<br><strong>AapnoKaam Team</strong></p>
                </td></tr>
                <tr><td align="center" style="padding-top:20px;font-size:12px;color:#95a5a6;">
                  © 2026 AapnoKaam. All rights reserved.
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body></html>
        """.formatted(
                name,
                booking.getId(),
                booking.getServiceTitle(),
                booking.getConsumer().getFullName(),
                booking.getScheduledDate().toLocalDate(),
                booking.getScheduledTime().toLocalTime(),
                booking.getEstimatedDuration(),
                booking.getEstimatedCost(),
                booking.getAddress(), booking.getCity()
        );

        sendHtmlEmail(toEmail, "🎉 New Booking Confirmed - AapnoKaam #" + booking.getId(), htmlBody);
        log.info("Booking notification email sent to worker: {}", toEmail);
    }
    public void sendJobCompletionEmailToConsumer(String toEmail, String name, Booking booking) {
        String htmlBody = """
        <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f4f6f8;">
          <table width="100%%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:40px 0;">
              <table width="600" style="background:#fff;border-radius:8px;padding:30px;">
                <tr><td align="center" style="padding-bottom:20px;">
                  <h1 style="color:#2c3e50;">AapnoKaam</h1>
                </td></tr>
                <tr><td style="color:#2c3e50;font-size:15px;line-height:1.7;">
                  <p>Dear <strong>%s</strong>,</p>
                  <p>✅ Your service has been <strong style="color:#1abc9c;">completed</strong>!</p>
                  <table width="100%%" style="background:#f8f9fa;border-radius:6px;padding:16px;margin:16px 0;">
                    <tr><td><strong>Booking ID:</strong></td><td>#%d</td></tr>
                    <tr><td><strong>Service:</strong></td><td>%s</td></tr>
                    <tr><td><strong>Worker:</strong></td><td>%s</td></tr>
                    <tr><td><strong>Final Cost:</strong></td><td>₹%s</td></tr>
                  </table>
                  <p>We hope you're satisfied with the service!
                     Please take a moment to <strong>leave a review</strong> in the app.</p>
                  <p>Regards,<br><strong>AapnoKaam Team</strong></p>
                </td></tr>
                <tr><td align="center" style="padding-top:20px;font-size:12px;color:#95a5a6;">
                  © 2026 AapnoKaam. All rights reserved.
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body></html>
        """.formatted(
                name,
                booking.getId(),
                booking.getServiceTitle(),
                booking.getWorker().getFullName(),
                booking.getActualCost() != null ? booking.getActualCost() : booking.getEstimatedCost()
        );

        sendHtmlEmail(toEmail, "✅ Service Completed - AapnoKaam #" + booking.getId(), htmlBody);
        log.info("Job completion email sent to consumer: {}", toEmail);
    }

    public void sendJobCompletionEmailToWorker(String toEmail, String name, Booking booking) {
        String htmlBody = """
        <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f4f6f8;">
          <table width="100%%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:40px 0;">
              <table width="600" style="background:#fff;border-radius:8px;padding:30px;">
                <tr><td align="center" style="padding-bottom:20px;">
                  <h1 style="color:#2c3e50;">AapnoKaam</h1>
                </td></tr>
                <tr><td style="color:#2c3e50;font-size:15px;line-height:1.7;">
                  <p>Dear <strong>%s</strong>,</p>
                  <p>🎉 Great work! Booking <strong>#%d</strong> has been marked as completed.</p>
                  <table width="100%%" style="background:#f8f9fa;border-radius:6px;padding:16px;margin:16px 0;">
                    <tr><td><strong>Service:</strong></td><td>%s</td></tr>
                    <tr><td><strong>Customer:</strong></td><td>%s</td></tr>
                    <tr><td><strong>Earnings:</strong></td><td>₹%s</td></tr>
                  </table>
                  <p>Your total jobs completed has been updated. Keep up the great work!</p>
                  <p>Regards,<br><strong>AapnoKaam Team</strong></p>
                </td></tr>
                <tr><td align="center" style="padding-top:20px;font-size:12px;color:#95a5a6;">
                  © 2026 AapnoKaam. All rights reserved.
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body></html>
        """.formatted(
                name,
                booking.getId(),
                booking.getServiceTitle(),
                booking.getConsumer().getFullName(),
                booking.getActualCost() != null ? booking.getActualCost() : booking.getEstimatedCost()
        );

        sendHtmlEmail(toEmail, "🎉 Job Completed - AapnoKaam #" + booking.getId(), htmlBody);
        log.info("Job completion email sent to worker: {}", toEmail);
    }
}