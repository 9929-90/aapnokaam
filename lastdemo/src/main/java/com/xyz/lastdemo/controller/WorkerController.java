package com.xyz.lastdemo.controller;

import com.xyz.lastdemo.dto.*;
import com.xyz.lastdemo.entity.User;
import com.xyz.lastdemo.entity.UserRole;
import com.xyz.lastdemo.entity.WorkerProfile;
import com.xyz.lastdemo.repository.UserRepository;
import com.xyz.lastdemo.repository.WorkerProfileRepository;
import com.xyz.lastdemo.service.WorkerBookingService;
import com.xyz.lastdemo.service.WorkerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Worker Dashboard Controller
 * Handles all worker-specific operations including booking management
 */
@RestController
@RequestMapping("/api/worker")
@PreAuthorize("hasRole('WORKER')")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkerService workerService;
    private final WorkerBookingService workerBookingService;
    private final WorkerProfileRepository workerProfileRepository;
    private final UserRepository userRepository;

    // ========== Dashboard & Profile ==========

    @GetMapping("/dashboard")
    public ResponseEntity<WorkerDashboardResponse> getDashboard(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(workerService.getWorkerDashboard(user.getId()));
    }

    @PutMapping("/availability")
    public ResponseEntity<AvailabilityResponse> toggleAvailability(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AvailabilityRequest request) {
        return ResponseEntity.ok(workerService.updateAvailability(user.getId(), request));
    }

    @GetMapping("/profile")
    public ResponseEntity<WorkerProfileResponse> getProfile(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(workerService.getWorkerProfile(user.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<MessageResponse> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateWorkerProfileRequest request) {
        return ResponseEntity.ok(workerService.updateProfile(user.getId(), request));
    }

    @PostMapping("/profile/picture")
    public ResponseEntity<MessageResponse> uploadProfilePicture(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(workerService.uploadProfilePicture(user.getId(), file));
    }

    // ========== Skills & Categories ==========

    @GetMapping("/skills")
    public ResponseEntity<List<WorkerSkillDTO>> getSkills(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(workerService.getWorkerSkills(user.getId()));
    }

    @PutMapping("/skills")
    public ResponseEntity<MessageResponse> updateSkills(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateSkillsRequest request) {
        return ResponseEntity.ok(workerService.updateSkills(user.getId(), request));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<SkillCategoryDTO>> getAvailableCategories() {
        return ResponseEntity.ok(workerService.getAllSkillCategories());
    }

    // ========== Reviews & Stats ==========

    @GetMapping("/reviews")
    public ResponseEntity<ReviewSummaryResponse> getReviews(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(workerService.getWorkerReviews(user.getId(), page, size));
    }

    @GetMapping("/stats")
    public ResponseEntity<WorkerStatsResponse> getStats(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(workerService.getWorkerStats(user.getId()));
    }

    // ========== Booking Management ==========

    @GetMapping("/bookings")
    public ResponseEntity<BookingListResponse> getBookings(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                workerBookingService.getWorkerBookings(user.getId(), status, page, size)
        );
    }

    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<BookingDetailResponse> getBookingDetails(
            @AuthenticationPrincipal User user,
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(
                workerBookingService.getBookingDetails(user.getId(), bookingId)
        );
    }

    @PutMapping("/bookings/{bookingId}/accept")
    public ResponseEntity<MessageResponse> acceptBooking(
            @AuthenticationPrincipal User user,
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(
                workerBookingService.acceptBooking(user.getId(), bookingId)
        );
    }

    @PutMapping("/bookings/{bookingId}/reject")
    public ResponseEntity<MessageResponse> rejectBooking(
            @AuthenticationPrincipal User user,
            @PathVariable Long bookingId,
            @Valid @RequestBody RejectBookingRequest request) {
        return ResponseEntity.ok(
                workerBookingService.rejectBooking(user.getId(), bookingId, request)
        );
    }

    @PutMapping("/bookings/{bookingId}/start")
    public ResponseEntity<MessageResponse> startBooking(
            @AuthenticationPrincipal User user,
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(
                workerBookingService.startBooking(user.getId(), bookingId)
        );
    }

    @PutMapping("/bookings/{bookingId}/complete")
    public ResponseEntity<MessageResponse> completeBooking(
            @AuthenticationPrincipal User user,
            @PathVariable Long bookingId,
            @Valid @RequestBody CompleteBookingRequest request) {
        return ResponseEntity.ok(
                workerBookingService.completeBooking(user.getId(), bookingId, request)
        );
    }

    @PutMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<MessageResponse> cancelBooking(
            @AuthenticationPrincipal User user,
            @PathVariable Long bookingId,
            @Valid @RequestBody CancelBookingRequest request) {
        return ResponseEntity.ok(
                workerBookingService.cancelBooking(user.getId(), bookingId, request)
        );
    }

    // List all approved & available workers
    @GetMapping
    public List<WorkerProfile> getAllWorkers() {
        return workerProfileRepository.findAll()
                .stream()
                .filter(w ->
                        w.getUser().getRole() == UserRole.WORKER &&
                                w.getUser().isWorkerApproved() &&
                                w.getIsAvailable()
                )
                .toList();
    }
}
