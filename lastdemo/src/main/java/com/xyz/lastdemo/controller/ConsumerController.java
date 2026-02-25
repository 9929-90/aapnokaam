    package com.xyz.lastdemo.controller;

    import com.xyz.lastdemo.dto.*;
    import com.xyz.lastdemo.entity.User;
    import com.xyz.lastdemo.service.ConsumerService;
    import jakarta.validation.Valid;
    import lombok.RequiredArgsConstructor;
    import org.springframework.http.ResponseEntity;
    import org.springframework.security.access.prepost.PreAuthorize;
    import org.springframework.security.core.annotation.AuthenticationPrincipal;
    import org.springframework.web.bind.annotation.*;
    import org.springframework.web.multipart.MultipartFile;

    import java.util.List;

    /**
     * Consumer Dashboard Controller
     * Handles all consumer-specific operations
     */
    @RestController
    @RequestMapping("/api/consumer")
    @PreAuthorize("hasRole('CONSUMER')")
    @RequiredArgsConstructor
    public class ConsumerController {

        private final ConsumerService consumerService;

        /**
         * Get consumer dashboard overview
         * GET /api/consumer/dashboard
         */
        @GetMapping("/dashboard")
        public ResponseEntity<ConsumerDashboardResponse> getDashboard(
                @AuthenticationPrincipal User user) {
            return ResponseEntity.ok(consumerService.getConsumerDashboard(user.getId()));
        }

        /**
         * Search workers by location and filters
         * GET /api/consumer/workers/search
         */
        @GetMapping("/workers/search")
        public ResponseEntity<WorkerSearchResponse> searchWorkers(
                @AuthenticationPrincipal User user,
                @RequestParam(required = false) Long categoryId,
                @RequestParam(required = false) String city,
                @RequestParam(required = false) String state,
                @RequestParam(required = false) String pincode,
                @RequestParam(required = false) Double latitude,
                @RequestParam(required = false) Double longitude,
                @RequestParam(required = false) Double radiusKm,
                @RequestParam(required = false) Double minRating,
                @RequestParam(required = false) Double maxHourlyRate,
                @RequestParam(required = false) Boolean availableOnly,
                @RequestParam(required = false) String sortBy,
                @RequestParam(defaultValue = "0") int page,
                @RequestParam(defaultValue = "20") int size) {

            WorkerSearchRequest searchRequest = WorkerSearchRequest.builder()
                    .categoryId(categoryId)
                    .city(city)
                    .state(state)
                    .pincode(pincode)
                    .latitude(latitude)
                    .longitude(longitude)
                    .radiusKm(radiusKm)
                    .minRating(minRating)
                    .maxHourlyRate(maxHourlyRate)
                    .availableOnly(availableOnly != null ? availableOnly : false)
                    .sortBy(sortBy != null ? sortBy : "rating")
                    .page(page)
                    .size(size)
                    .build();

            return ResponseEntity.ok(consumerService.searchWorkers(searchRequest));
        }

        /**
         * Get worker details by ID
         * GET /api/consumer/workers/{workerId}
         */
        @GetMapping("/workers/{workerId}")
        public ResponseEntity<WorkerDetailResponse> getWorkerDetails(
                @PathVariable Long workerId) {
            return ResponseEntity.ok(consumerService.getWorkerDetails(workerId));
        }

        /**
         * Get worker reviews
         * GET /api/consumer/workers/{workerId}/reviews
         */
        @GetMapping("/workers/{workerId}/reviews")
        public ResponseEntity<ReviewSummaryResponse> getWorkerReviews(
                @PathVariable Long workerId,
                @RequestParam(defaultValue = "0") int page,
                @RequestParam(defaultValue = "10") int size) {
            return ResponseEntity.ok(consumerService.getWorkerReviews(workerId, page, size));
        }

        /**
         * Get all skill categories
         * GET /api/consumer/categories
         */
        @GetMapping("/categories")
        public ResponseEntity<List<SkillCategoryDTO>> getCategories() {
            return ResponseEntity.ok(consumerService.getAllCategories());
        }

        /**
         * Create a booking
         * POST /api/consumer/bookings
         */
        @PostMapping("/bookings")
        public ResponseEntity<BookingResponse> createBooking(
                @AuthenticationPrincipal User user,
                @Valid @RequestBody CreateBookingRequest request) {
            return ResponseEntity.ok(consumerService.createBooking(user.getId(), request));
        }

        /**
         * Get consumer bookings
         * GET /api/consumer/bookings
         */
        @GetMapping("/bookings")
        public ResponseEntity<BookingListResponse> getBookings(
                @AuthenticationPrincipal User user,
                @RequestParam(required = false) String status,
                @RequestParam(defaultValue = "0") int page,
                @RequestParam(defaultValue = "10") int size) {
            return ResponseEntity.ok(consumerService.getConsumerBookings(user.getId(), status, page, size));
        }

        /**
         * Get booking by ID
         * GET /api/consumer/bookings/{bookingId}
         */
        @GetMapping("/bookings/{bookingId}")
        public ResponseEntity<BookingDetailResponse> getBookingDetails(
                @AuthenticationPrincipal User user,
                @PathVariable Long bookingId) {
            return ResponseEntity.ok(consumerService.getBookingDetails(user.getId(), bookingId));
        }

        /**
         * Cancel booking
         * PUT /api/consumer/bookings/{bookingId}/cancel
         */
        @PutMapping("/bookings/{bookingId}/cancel")
        public ResponseEntity<MessageResponse> cancelBooking(
                @AuthenticationPrincipal User user,
                @PathVariable Long bookingId,
                @Valid @RequestBody CancelBookingRequest request) {
            return ResponseEntity.ok(consumerService.cancelBooking(user.getId(), bookingId, request));
        }

        /**
         * Complete booking (consumer marks as completed)
         * PUT /api/consumer/bookings/{bookingId}/complete
         */
        @PutMapping("/bookings/{bookingId}/complete")
        public ResponseEntity<MessageResponse> completeBooking(
                @AuthenticationPrincipal User user,
                @PathVariable Long bookingId) {
            return ResponseEntity.ok(consumerService.completeBooking(user.getId(), bookingId));
        }

        /**
         * Submit rating and review
         * POST /api/consumer/bookings/{bookingId}/review
         */
        @PostMapping("/bookings/{bookingId}/review")
        public ResponseEntity<MessageResponse> submitReview(
                @AuthenticationPrincipal User user,
                @PathVariable Long bookingId,
                @Valid @RequestBody SubmitReviewRequest request) {
            return ResponseEntity.ok(consumerService.submitReview(user.getId(), bookingId, request));
        }

        /**
         * Get consumer profile
         * GET /api/consumer/profile
         */
        @GetMapping("/profile")
        public ResponseEntity<ConsumerProfileResponse> getProfile(
                @AuthenticationPrincipal User user) {
            return ResponseEntity.ok(consumerService.getConsumerProfile(user.getId()));
        }

        /**
         * Update consumer profile
         * PUT /api/consumer/profile
         */
        @PutMapping("/profile")
        public ResponseEntity<MessageResponse> updateProfile(
                @AuthenticationPrincipal User user,
                @Valid @RequestBody UpdateConsumerProfileRequest request) {
            return ResponseEntity.ok(consumerService.updateProfile(user.getId(), request));
        }

        /**
         * Upload profile picture
         * POST /api/consumer/profile/picture
         */
        @PostMapping("/profile/picture")
        public ResponseEntity<MessageResponse> uploadProfilePicture(
                @AuthenticationPrincipal User user,
                @RequestParam("file") MultipartFile file) {
            return ResponseEntity.ok(consumerService.uploadProfilePicture(user.getId(), file));
        }

        /**
         * Get consumer statistics
         * GET /api/consumer/stats
         */
        @GetMapping("/stats")
        public ResponseEntity<ConsumerStatsResponse> getStats(
                @AuthenticationPrincipal User user) {
            return ResponseEntity.ok(consumerService.getConsumerStats(user.getId()));
        }

        /**
         * Add worker to favorites
         * POST /api/consumer/favorites/{workerId}
         */
        @PostMapping("/favorites/{workerId}")
        public ResponseEntity<MessageResponse> addToFavorites(
                @AuthenticationPrincipal User user,
                @PathVariable Long workerId) {
            return ResponseEntity.ok(consumerService.addToFavorites(user.getId(), workerId));
        }

        /**
         * Remove worker from favorites
         * DELETE /api/consumer/favorites/{workerId}
         */
        @DeleteMapping("/favorites/{workerId}")
        public ResponseEntity<MessageResponse> removeFromFavorites(
                @AuthenticationPrincipal User user,
                @PathVariable Long workerId) {
            return ResponseEntity.ok(consumerService.removeFromFavorites(user.getId(), workerId));
        }

        /**
         * Get favorite workers
         * GET /api/consumer/favorites
         */
        @GetMapping("/favorites")
        public ResponseEntity<List<WorkerCardDTO>> getFavorites(
                @AuthenticationPrincipal User user) {
            return ResponseEntity.ok(consumerService.getFavoriteWorkers(user.getId()));
        }

        /**
         * Get all workers (for initial dashboard display)
         * GET /api/consumer/workers
         */
        @GetMapping("/workers")
        public ResponseEntity<WorkerSearchResponse> getAllWorkers(
                @AuthenticationPrincipal User user,
                @RequestParam(defaultValue = "0") int page,
                @RequestParam(defaultValue = "20") int size,
                @RequestParam(required = false) String sortBy) {
            return ResponseEntity.ok(consumerService.getAllWorkers(page, size, sortBy));
        }

        /**
         * Initiate chat with worker
         * POST /api/consumer/chat/initiate/{workerId}
         */
        @PostMapping("/chat/initiate/{workerId}")
        public ResponseEntity<ConversationDTO> initiateChat(
                @AuthenticationPrincipal User user,
                @PathVariable Long workerId) {
            return ResponseEntity.ok(consumerService.initiateChat(user.getId(), workerId));
        }
    }