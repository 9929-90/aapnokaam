package com.xyz.lastdemo.controller;

import com.xyz.lastdemo.dto.*;
import com.xyz.lastdemo.service.AdminService;
import com.xyz.lastdemo.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin Controller — full system visibility
 *
 * All endpoints require ADMIN role.
 *
 * Stats:
 *   GET  /api/admin/stats
 *
 * Worker approvals (existing):
 *   GET  /api/admin/workers/pending
 *   POST /api/admin/workers/{id}/approve
 *   POST /api/admin/workers/{id}/reject
 *
 * User management:
 *   GET  /api/admin/users?role=&page=&size=&search=
 *   GET  /api/admin/users/{id}
 *   POST /api/admin/users/{id}/toggle-enabled
 *
 * Booking management:
 *   GET  /api/admin/bookings?status=&page=&size=&search=
 *   GET  /api/admin/bookings/{id}
 *   POST /api/admin/bookings/{id}/cancel
 *
 * Payment management:
 *   GET  /api/admin/payments?status=&page=&size=&search=
 *
 * Notifications:
 *   POST /api/admin/users/{id}/notify
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AuthService authService;
    private final AdminService adminService;

    // ── Stats ────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getSystemStats() {
        return ResponseEntity.ok(adminService.getSystemStats());
    }

    // ── Worker approvals (existing) ──────────────────

    @GetMapping("/workers/pending")
    public ResponseEntity<List<PendingWorkerDTO>> getPendingWorkers() {
        return ResponseEntity.ok(authService.getPendingWorkers());
    }

    @PostMapping("/workers/{workerId}/approve")
    public ResponseEntity<MessageResponse> approveWorker(@PathVariable Long workerId) {
        return ResponseEntity.ok(authService.approveWorker(workerId, true));
    }

    @PostMapping("/workers/{workerId}/reject")
    public ResponseEntity<MessageResponse> rejectWorker(@PathVariable Long workerId) {
        return ResponseEntity.ok(authService.approveWorker(workerId, false));
    }

    // ── User management ──────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getAllUsers(page, size, role, search));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<AdminUserDTO> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getUserById(userId));
    }

    @PostMapping("/users/{userId}/toggle-enabled")
    public ResponseEntity<MessageResponse> toggleUserEnabled(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.toggleUserEnabled(userId));
    }

    @PostMapping("/users/{userId}/notify")
    public ResponseEntity<MessageResponse> sendNotification(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        String title   = body.getOrDefault("title", "Admin Notification");
        String message = body.getOrDefault("message", "");
        return ResponseEntity.ok(adminService.sendNotificationToUser(userId, title, message));
    }

    // ── Booking management ───────────────────────────

    @GetMapping("/bookings")
    public ResponseEntity<Page<AdminBookingDTO>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getAllBookings(page, size, status, search));
    }

    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<AdminBookingDTO> getBookingById(@PathVariable Long bookingId) {
        return ResponseEntity.ok(adminService.getBookingById(bookingId));
    }

    @PostMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<MessageResponse> cancelBooking(
            @PathVariable Long bookingId,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(adminService.cancelBooking(bookingId, reason));
    }

    // ── Payment management ───────────────────────────

    @GetMapping("/payments")
    public ResponseEntity<Page<AdminPaymentDTO>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(adminService.getAllPayments(page, size, status, search));
    }
}