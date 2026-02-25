package com.xyz.lastdemo.service;

import com.xyz.lastdemo.dto.*;
import com.xyz.lastdemo.entity.*;
import com.xyz.lastdemo.exception.BookingException;
import com.xyz.lastdemo.exception.ResourceNotFoundException;
import com.xyz.lastdemo.exception.UnauthorizedException;
import com.xyz.lastdemo.repository.*;
import com.xyz.lastdemo.specification.WorkerProfileSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Consumer Service
 * Handles all consumer operations: search, booking, reviews
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ConsumerService {

    private final UserRepository userRepository;
    private final ConsumerProfileRepository consumerProfileRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final SkillCategoryRepository skillCategoryRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final FavoriteWorkerRepository favoriteWorkerRepository;
    private final ConversationRepository conversationRepository;
    private final NotificationRepository notificationRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;
    private final ChatService chatService;

    // Injected to create a Razorpay order right after booking is saved
    private final PaymentService paymentService;

    /**
     * Search workers with location and filters
     */
    @Transactional(readOnly = true)
    public WorkerSearchResponse searchWorkers(WorkerSearchRequest request) {
        log.debug("Search request: lat={}, lon={}, radius={}, availableOnly={}, sortBy={}",
                request.getLatitude(), request.getLongitude(), request.getRadiusKm(),
                request.getAvailableOnly(), request.getSortBy());

        Specification<WorkerProfile> spec = WorkerProfileSpecification.buildSpecification(request);

        Sort sort = buildSort(request.getSortBy());
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Page<WorkerProfile> workerPage = workerProfileRepository.findAll(spec, pageable);

        log.debug("Found {} workers after filtering", workerPage.getTotalElements());

        List<WorkerCardDTO> workers = workerPage.getContent().stream()
                .map(worker -> mapWorkerToCardDTO(worker, request.getLatitude(), request.getLongitude()))
                .collect(Collectors.toList());

        if (request.getLatitude() != null && request.getLongitude() != null && workerPage.isEmpty()) {
            log.warn("No workers found within {} km of lat={}, lon={}",
                    request.getRadiusKm(), request.getLatitude(), request.getLongitude());
        }

        return WorkerSearchResponse.builder()
                .workers(workers)
                .totalResults(workerPage.getTotalElements())
                .currentPage(request.getPage())
                .totalPages(workerPage.getTotalPages())
                .build();
    }

    /**
     * Get worker details
     */
    @Transactional(readOnly = true)
    public WorkerDetailResponse getWorkerDetails(Long workerId) {
        WorkerProfile worker = getWorkerProfileById(workerId);

        List<WorkerSkillDTO> skills = worker.getSkills().stream()
                .map(this::mapWorkerSkillToDTO)
                .collect(Collectors.toList());

        List<ReviewDTO> recentReviews = reviewRepository
                .findTop5ByWorkerIdOrderByCreatedAtDesc(workerId)
                .stream()
                .map(this::mapReviewToDTO)
                .collect(Collectors.toList());

        return WorkerDetailResponse.builder()
                .id(worker.getId())
                .userId(worker.getUser().getId())
                .workerId(worker.getUser().getWorkerId())
                .fullName(worker.getFullName())
                .profilePictureUrl(worker.getProfilePictureUrl())
                .bio(worker.getBio())
                .experienceYears(worker.getExperienceYears())
                .hourlyRate(worker.getHourlyRate())
                .city(worker.getCity())
                .state(worker.getState())
                .pincode(worker.getPincode())
                .latitude(worker.getLatitude())
                .longitude(worker.getLongitude())
                .isAvailable(worker.getIsAvailable())
                .isVerified(worker.getIsVerified())
                .averageRating(worker.getAverageRating())
                .totalReviews(worker.getTotalReviews())
                .totalJobsCompleted(worker.getTotalJobsCompleted())
                .languagesSpoken(worker.getLanguagesSpoken())
                .responseRate(calculateResponseRate(worker.getId()))
                .skills(skills)
                .recentReviews(recentReviews)
                .joinedDate(worker.getCreatedAt().toLocalDate())
                .build();
    }

    /**
     * Get worker reviews with pagination
     */
    @Transactional(readOnly = true)
    public ReviewSummaryResponse getWorkerReviews(Long workerId, int page, int size) {
        WorkerProfile worker = getWorkerProfileById(workerId);
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviewPage = reviewRepository.findByWorkerIdOrderByCreatedAtDesc(workerId, pageable);

        List<ReviewDTO> reviews = reviewPage.getContent().stream()
                .map(this::mapReviewToDTO)
                .collect(Collectors.toList());

        ReviewSummaryResponse.RatingDistribution distribution = ReviewSummaryResponse.RatingDistribution.builder()
                .fiveStars(reviewRepository.countByWorkerIdAndRating(workerId, 5))
                .fourStars(reviewRepository.countByWorkerIdAndRating(workerId, 4))
                .threeStars(reviewRepository.countByWorkerIdAndRating(workerId, 3))
                .twoStars(reviewRepository.countByWorkerIdAndRating(workerId, 2))
                .oneStar(reviewRepository.countByWorkerIdAndRating(workerId, 1))
                .build();

        return ReviewSummaryResponse.builder()
                .averageRating(worker.getAverageRating())
                .totalReviews(worker.getTotalReviews())
                .ratingDistribution(distribution)
                .reviews(reviews)
                .currentPage(page)
                .totalPages(reviewPage.getTotalPages())
                .totalElements(reviewPage.getTotalElements())
                .build();
    }

    /**
     * Get all categories
     */
    @Transactional(readOnly = true)
    public List<SkillCategoryDTO> getAllCategories() {
        return skillCategoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::mapSkillCategoryToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create booking + immediately create a Razorpay payment order.
     *
     * The frontend receives everything it needs in a single response:
     *   - bookingId, status, estimatedCost  (booking info)
     *   - razorpayKeyId, razorpayOrderId    (to open Razorpay modal)
     *   - customerName/email/phone          (to prefill Razorpay modal)
     *
     * Frontend flow after receiving this response:
     *   1. Open Razorpay modal using the returned keys
     *   2. On payment success → POST /api/payments/verify
     */
    @Transactional
    public BookingResponse createBooking(Long userId, CreateBookingRequest request) {
        ConsumerProfile consumer = getConsumerProfileByUserId(userId);
        WorkerProfile worker = getWorkerProfileById(request.getWorkerId());

        // Validate worker availability
        if (!worker.getIsAvailable()) {
            throw new BookingException("Worker is currently unavailable");
        }

        // Validate booking dates
        validateBookingDates(request.getScheduledDate(), request.getScheduledTime(),
                request.getEstimatedDuration());

        // Check for conflicting bookings
        if (hasConflictingBooking(worker.getId(), request.getScheduledDate(),
                request.getScheduledTime(), request.getEstimatedDuration())) {
            throw new BookingException("Worker already has a booking at this time");
        }

        // Calculate estimated cost
        BigDecimal estimatedCost = worker.getHourlyRate()
                .multiply(BigDecimal.valueOf(request.getEstimatedDuration()))
                .setScale(2, RoundingMode.HALF_UP);

        // Save booking with PENDING status
        Booking booking = Booking.builder()
                .consumer(consumer)
                .worker(worker)
                .category(skillCategoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found")))
                .serviceTitle(request.getServiceTitle())
                .serviceDescription(request.getServiceDescription())
                .scheduledDate(request.getScheduledDate())
                .scheduledTime(request.getScheduledTime())
                .estimatedDuration(request.getEstimatedDuration())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .hourlyRate(worker.getHourlyRate())
                .estimatedCost(estimatedCost)
                .status(Booking.BookingStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        bookingRepository.save(booking);

        // Update consumer stats
        consumer.setTotalBookings(consumer.getTotalBookings() + 1);
        consumerProfileRepository.save(consumer);

        // Notify worker
        notificationService.createNotification(
                worker.getUser(),
                "New Booking Request",
                consumer.getFullName() + " has requested a booking for " + request.getServiceTitle(),
                Notification.NotificationType.NEW_BOOKING,
                booking.getId(),
                "/worker/bookings/" + booking.getId()
        );

        log.info("Booking created: ID {} for worker {} by consumer {}",
                booking.getId(), worker.getId(), consumer.getId());

        // Create Razorpay order immediately and embed into response.
        // This avoids a second round-trip from the frontend.
        PaymentOrderResponse paymentOrder = paymentService.createOrder(userId, booking.getId());

        return BookingResponse.builder()
                .bookingId(booking.getId())
                .status(booking.getStatus().name())
                .message("Booking created! Complete payment to confirm.")
                .estimatedCost(estimatedCost)
                // Razorpay fields — frontend opens modal with these
                .razorpayKeyId(paymentOrder.getRazorpayKeyId())
                .razorpayOrderId(paymentOrder.getRazorpayOrderId())
                .paymentId(paymentOrder.getPaymentId())
                .customerName(paymentOrder.getCustomerName())
                .customerEmail(paymentOrder.getCustomerEmail())
                .customerPhone(paymentOrder.getCustomerPhone())
                .build();
    }

    /**
     * Get consumer bookings
     */
    @Transactional
    public BookingListResponse getConsumerBookings(Long userId, String status, int page, int size) {
        ConsumerProfile consumer = getConsumerProfileByUserId(userId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Booking> bookingPage;
        if (status != null && !status.isEmpty()) {
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
            bookingPage = bookingRepository.findByConsumerIdAndStatus(consumer.getId(), bookingStatus, pageable);
        } else {
            bookingPage = bookingRepository.findByConsumerId(consumer.getId(), pageable);
        }

        List<BookingCardDTO> bookings = bookingPage.getContent().stream()
                .map(this::mapBookingToCardDTO)
                .collect(Collectors.toList());

        return BookingListResponse.builder()
                .bookings(bookings)
                .currentPage(page)
                .totalPages(bookingPage.getTotalPages())
                .totalElements(bookingPage.getTotalElements())
                .build();
    }

    /**
     * Get booking details
     */
    @Transactional(readOnly = true)
    public BookingDetailResponse getBookingDetails(Long userId, Long bookingId) {
        Booking booking = getBookingById(bookingId);
        validateConsumerBooking(userId, booking);
        return mapBookingToDetailResponse(booking);
    }

    /**
     * Cancel booking
     */
    @Transactional
    public MessageResponse cancelBooking(Long userId, Long bookingId, CancelBookingRequest request) {
        Booking booking = getBookingById(bookingId);
        validateConsumerBooking(userId, booking);

        if (booking.getStatus() == Booking.BookingStatus.COMPLETED ||
                booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BookingException("Cannot cancel a " + booking.getStatus().name().toLowerCase() + " booking");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancellationReason(request.getReason());
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancelledBy("CONSUMER");
        bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getWorker().getUser(),
                "Booking Cancelled",
                "Booking #" + booking.getId() + " has been cancelled by the consumer",
                Notification.NotificationType.BOOKING_CANCELLED,
                booking.getId(),
                "/worker/bookings/" + booking.getId()
        );

        log.info("Booking {} cancelled by consumer {}", bookingId, userId);

        return MessageResponse.builder()
                .success(true)
                .message("Booking cancelled successfully")
                .build();
    }

    /**
     * Complete booking (consumer side)
     */
    @Transactional
    public MessageResponse completeBooking(Long userId, Long bookingId) {
        Booking booking = getBookingById(bookingId);
        validateConsumerBooking(userId, booking);

        if (booking.getStatus() != Booking.BookingStatus.IN_PROGRESS) {
            throw new BookingException("Only in-progress bookings can be marked as completed");
        }

        booking.setStatus(Booking.BookingStatus.COMPLETED);
        booking.setCompletedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        WorkerProfile worker = booking.getWorker();
        worker.setTotalJobsCompleted(worker.getTotalJobsCompleted() + 1);
        workerProfileRepository.save(worker);

        notificationService.createNotification(
                worker.getUser(),
                "Booking Completed",
                "Booking #" + booking.getId() + " has been marked as completed",
                Notification.NotificationType.BOOKING_COMPLETED,
                booking.getId(),
                "/worker/bookings/" + booking.getId()
        );

        log.info("Booking {} completed by consumer {}", bookingId, userId);

        return MessageResponse.builder()
                .success(true)
                .message("Booking marked as completed. Please leave a review!")
                .build();
    }

    /**
     * Submit review for completed booking
     */
    @Transactional
    public MessageResponse submitReview(Long userId, Long bookingId, SubmitReviewRequest request) {
        Booking booking = getBookingById(bookingId);
        validateConsumerBooking(userId, booking);

        if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
            throw new BookingException("Can only review completed bookings");
        }

        if (booking.getReview() != null) {
            throw new BookingException("Review already submitted for this booking");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new BookingException("Rating must be between 1 and 5");
        }

        Review review = Review.builder()
                .booking(booking)
                .worker(booking.getWorker())
                .consumer(booking.getConsumer())
                .rating(BigDecimal.valueOf(request.getRating()))
                .comment(request.getComment())
                .isVerified(true)
                .helpfulCount(0)
                .build();

        reviewRepository.save(review);
        booking.setReview(review);
        bookingRepository.save(booking);

        updateWorkerRatingIncrementally(booking.getWorker(), request.getRating());

        ConsumerProfile consumer = booking.getConsumer();
        consumer.setTotalReviewsGiven(consumer.getTotalReviewsGiven() + 1);
        consumerProfileRepository.save(consumer);

        notificationService.createNotification(
                booking.getWorker().getUser(),
                "New Review Received",
                "You received a " + request.getRating() + " star review",
                Notification.NotificationType.NEW_REVIEW,
                review.getId(),
                "/worker/reviews"
        );

        log.info("Review submitted for booking {} by consumer {}", bookingId, userId);

        return MessageResponse.builder()
                .success(true)
                .message("Review submitted successfully. Thank you for your feedback!")
                .build();
    }

    /**
     * Get consumer profile
     */
    @Transactional
    public ConsumerProfileResponse getConsumerProfile(Long userId) {
        ConsumerProfile profile = getConsumerProfileByUserId(userId);

        return ConsumerProfileResponse.builder()
                .id(profile.getId())
                .fullName(profile.getFullName())
                .email(profile.getUser().getEmail())
                .phoneNumber(profile.getPhoneNumber())
                .profilePictureUrl(profile.getProfilePictureUrl())
                .address(profile.getAddress())
                .city(profile.getCity())
                .state(profile.getState())
                .pincode(profile.getPincode())
                .totalBookings(profile.getTotalBookings())
                .totalReviewsGiven(profile.getTotalReviewsGiven())
                .memberSince(profile.getCreatedAt().toLocalDate())
                .build();
    }

    /**
     * Update consumer profile
     */
    @Transactional
    public MessageResponse updateProfile(Long userId, UpdateConsumerProfileRequest request) {
        ConsumerProfile profile = getConsumerProfileByUserId(userId);

        if (request.getFullName() != null) profile.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null) profile.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) profile.setAddress(request.getAddress());
        if (request.getCity() != null) profile.setCity(request.getCity());
        if (request.getState() != null) profile.setState(request.getState());
        if (request.getPincode() != null) profile.setPincode(request.getPincode());

        consumerProfileRepository.save(profile);
        log.info("Consumer profile updated for user: {}", userId);

        return MessageResponse.builder()
                .success(true)
                .message("Profile updated successfully")
                .build();
    }

    /**
     * Upload profile picture
     */
    @Transactional
    public MessageResponse uploadProfilePicture(Long userId, MultipartFile file) {
        ConsumerProfile profile = getConsumerProfileByUserId(userId);

        String imageUrl = fileStorageService.storeFile(file, "profiles");
        profile.setProfilePictureUrl(imageUrl);
        consumerProfileRepository.save(profile);

        log.info("Profile picture uploaded for consumer: {}", userId);

        return MessageResponse.builder()
                .success(true)
                .message("Profile picture uploaded successfully")
                .build();
    }

    /**
     * Get consumer statistics (public API)
     */
    @Transactional
    public ConsumerStatsResponse getConsumerStats(Long userId) {
        ConsumerProfile profile = getConsumerProfileByUserId(userId);
        return getConsumerStatsInternal(profile);
    }

    /**
     * Get consumer statistics (internal helper)
     */
    private ConsumerStatsResponse getConsumerStatsInternal(ConsumerProfile profile) {
        Integer pendingBookings = (int) bookingRepository.countByConsumerIdAndStatus(
                profile.getId(), Booking.BookingStatus.PENDING);
        Integer confirmedBookings = (int) bookingRepository.countByConsumerIdAndStatus(
                profile.getId(), Booking.BookingStatus.CONFIRMED);
        Integer completedBookings = (int) bookingRepository.countByConsumerIdAndStatus(
                profile.getId(), Booking.BookingStatus.COMPLETED);
        Integer cancelledBookings = (int) bookingRepository.countByConsumerIdAndStatus(
                profile.getId(), Booking.BookingStatus.CANCELLED);

        BigDecimal totalSpent = bookingRepository.calculateTotalSpentByConsumer(profile.getId());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM yyyy");
        String memberSince = profile.getCreatedAt().format(formatter);

        return ConsumerStatsResponse.builder()
                .totalBookings(profile.getTotalBookings())
                .pendingBookings(pendingBookings)
                .confirmedBookings(confirmedBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .totalReviewsGiven(profile.getTotalReviewsGiven())
                .totalSpent(totalSpent != null ? totalSpent : BigDecimal.ZERO)
                .favoriteWorkersCount(favoriteWorkerRepository.countByConsumerId(profile.getId()))
                .memberSince(memberSince)
                .build();
    }

    /**
     * Add worker to favorites
     */
    @Transactional
    public MessageResponse addToFavorites(Long userId, Long workerId) {
        ConsumerProfile consumer = getConsumerProfileByUserId(userId);
        WorkerProfile worker = getWorkerProfileById(workerId);

        if (favoriteWorkerRepository.existsByConsumerIdAndWorkerId(consumer.getId(), workerId)) {
            throw new BookingException("Worker already in favorites");
        }

        FavoriteWorker favorite = FavoriteWorker.builder()
                .consumer(consumer)
                .worker(worker)
                .build();

        favoriteWorkerRepository.save(favorite);
        log.info("Worker {} added to favorites by consumer {}", workerId, userId);

        return MessageResponse.builder()
                .success(true)
                .message("Worker added to favorites")
                .build();
    }

    /**
     * Remove worker from favorites
     */
    @Transactional
    public MessageResponse removeFromFavorites(Long userId, Long workerId) {
        ConsumerProfile consumer = getConsumerProfileByUserId(userId);

        FavoriteWorker favorite = favoriteWorkerRepository
                .findByConsumerIdAndWorkerId(consumer.getId(), workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Favorite not found"));

        favoriteWorkerRepository.delete(favorite);
        log.info("Worker {} removed from favorites by consumer {}", workerId, userId);

        return MessageResponse.builder()
                .success(true)
                .message("Worker removed from favorites")
                .build();
    }

    /**
     * Get favorite workers
     */
    @Transactional
    public List<WorkerCardDTO> getFavoriteWorkers(Long userId) {
        ConsumerProfile consumer = getConsumerProfileByUserId(userId);

        return favoriteWorkerRepository.findByConsumerId(consumer.getId())
                .stream()
                .map(fav -> mapWorkerToCardDTO(fav.getWorker(), null, null))
                .collect(Collectors.toList());
    }

    /**
     * Initiate chat with worker
     */
    @Transactional
    public ConversationDTO initiateChat(Long userId, Long workerId) {
        User consumer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found"));

        Conversation conversation = chatService.getOrCreateConversation(workerId, userId);

        return ConversationDTO.builder()
                .id(conversation.getId())
                .otherUserId(worker.getId())
                .otherUserName(worker.getUsername())
                .otherUserProfilePicture(null)
                .lastMessage(conversation.getLastMessage())
                .lastMessageAt(conversation.getLastMessageAt())
                .unreadCount(conversation.getConsumerUnreadCount())
                .isActive(conversation.getIsActive())
                .createdAt(conversation.getCreatedAt())
                .build();
    }

    // ========== Helper Methods ==========

    private ConsumerProfile getConsumerProfileByUserId(Long userId) {
        return consumerProfileRepository.findByUserId(userId)
                .orElseGet(() -> createConsumerProfile(userId));
    }

    private ConsumerProfile createConsumerProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ConsumerProfile profile = ConsumerProfile.builder()
                .user(user)
                .fullName(user.getUsername())
                .totalBookings(0)
                .totalReviewsGiven(0)
                .build();

        return consumerProfileRepository.save(profile);
    }

    private WorkerProfile getWorkerProfileById(Long workerId) {
        return workerProfileRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found"));
    }

    private Booking getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    private void validateConsumerBooking(Long userId, Booking booking) {
        if (!booking.getConsumer().getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to access this booking");
        }
    }

    private void validateBookingDates(LocalDateTime scheduledDate, LocalDateTime scheduledTime,
                                      Integer duration) {
        if (scheduledDate.isBefore(LocalDateTime.now())) {
            throw new BookingException("Cannot book for past dates");
        }
        if (scheduledDate.isAfter(LocalDateTime.now().plusMonths(3))) {
            throw new BookingException("Cannot book more than 3 months in advance");
        }
        if (duration < 1 || duration > 24) {
            throw new BookingException("Duration must be between 1 and 24 hours");
        }
    }

    private boolean hasConflictingBooking(Long workerId, LocalDateTime scheduledDate,
                                          LocalDateTime scheduledTime, Integer duration) {
        LocalDateTime endTime = scheduledTime.plusHours(duration);
        return bookingRepository.existsConflictingBooking(
                workerId, scheduledDate, scheduledTime, endTime);
    }

    private void updateWorkerRatingIncrementally(WorkerProfile worker, int newRating) {
        int oldCount = worker.getTotalReviews();
        BigDecimal oldAvg = worker.getAverageRating() != null
                ? worker.getAverageRating() : BigDecimal.ZERO;

        BigDecimal newAvg = oldAvg.multiply(BigDecimal.valueOf(oldCount))
                .add(BigDecimal.valueOf(newRating))
                .divide(BigDecimal.valueOf(oldCount + 1), 2, RoundingMode.HALF_UP);

        worker.setAverageRating(newAvg);
        worker.setTotalReviews(oldCount + 1);
        workerProfileRepository.save(worker);
    }

    private Integer calculateResponseRate(Long workerId) {
        // TODO: Implement proper calculation based on message response times
        return 95;
    }

    /**
     * Get all workers (for initial dashboard display)
     */
    @Transactional(readOnly = true)
    public WorkerSearchResponse getAllWorkers(int page, int size, String sortBy) {
        Sort sort = buildSort(sortBy != null ? sortBy : "rating");
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<WorkerProfile> spec = (root, query, criteriaBuilder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.isTrue(root.get("isVerified")));
            predicates.add(criteriaBuilder.isTrue(root.get("user").get("workerApproved")));
            return criteriaBuilder.and(
                    predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<WorkerProfile> workerPage = workerProfileRepository.findAll(spec, pageable);

        List<WorkerCardDTO> workers = workerPage.getContent().stream()
                .map(worker -> mapWorkerToCardDTO(worker, null, null))
                .collect(Collectors.toList());

        return WorkerSearchResponse.builder()
                .workers(workers)
                .totalResults(workerPage.getTotalElements())
                .currentPage(page)
                .totalPages(workerPage.getTotalPages())
                .build();
    }

    /**
     * Get consumer dashboard with featured workers
     */
    @Transactional
    public ConsumerDashboardResponse getConsumerDashboard(Long userId) {
        ConsumerProfile profile = getConsumerProfileByUserId(userId);

        Integer upcomingBookings = (int) bookingRepository.countByConsumerIdAndStatus(
                profile.getId(), Booking.BookingStatus.CONFIRMED);
        Integer unreadMessages = conversationRepository.countUnreadConversationsForConsumer(userId);
        Integer unreadNotifications = notificationRepository.countUnreadByUserId(userId);

        List<BookingCardDTO> recentBookings = bookingRepository
                .findTop5ByConsumerIdOrderByCreatedAtDesc(profile.getId())
                .stream()
                .map(this::mapBookingToCardDTO)
                .collect(Collectors.toList());

        List<WorkerCardDTO> featuredWorkers = getFeaturedWorkers();

        return ConsumerDashboardResponse.builder()
                .consumerName(profile.getFullName())
                .totalBookings(profile.getTotalBookings())
                .upcomingBookings(upcomingBookings)
                .unreadMessages(unreadMessages)
                .unreadNotifications(unreadNotifications)
                .recentBookings(recentBookings)
                .stats(getConsumerStatsInternal(profile))
                .featuredWorkers(featuredWorkers)
                .build();
    }

    /**
     * Get featured workers for dashboard
     */
    private List<WorkerCardDTO> getFeaturedWorkers() {
        Pageable pageable = PageRequest.of(0, 10,
                Sort.by(Sort.Direction.DESC, "averageRating"));

        Specification<WorkerProfile> spec = (root, query, criteriaBuilder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.isTrue(root.get("isVerified")));
            predicates.add(criteriaBuilder.isTrue(root.get("user").get("workerApproved")));
            predicates.add(criteriaBuilder.isTrue(root.get("isAvailable")));
            return criteriaBuilder.and(
                    predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return workerProfileRepository.findAll(spec, pageable)
                .getContent()
                .stream()
                .map(worker -> mapWorkerToCardDTO(worker, null, null))
                .collect(Collectors.toList());
    }

    private Sort buildSort(String sortBy) {
        return switch (sortBy != null ? sortBy : "rating") {
            case "rating"      -> Sort.by(Sort.Direction.DESC, "averageRating");
            case "price_low"   -> Sort.by(Sort.Direction.ASC,  "hourlyRate");
            case "price_high"  -> Sort.by(Sort.Direction.DESC, "hourlyRate");
            case "experience"  -> Sort.by(Sort.Direction.DESC, "experienceYears");
            case "jobs"        -> Sort.by(Sort.Direction.DESC, "totalJobsCompleted");
            default            -> Sort.by(Sort.Direction.DESC, "averageRating");
        };
    }

    private WorkerCardDTO mapWorkerToCardDTO(WorkerProfile worker, Double userLat, Double userLon) {
        Double distance = null;
        if (userLat != null && userLon != null
                && worker.getLatitude() != null && worker.getLongitude() != null) {
            distance = calculateDistance(userLat, userLon,
                    worker.getLatitude(), worker.getLongitude());
        }

        String primarySkill = worker.getSkills().stream()
                .filter(WorkerSkill::getIsPrimary)
                .findFirst()
                .map(skill -> skill.getCategory().getName())
                .orElse(null);

        return WorkerCardDTO.builder()
                .id(worker.getId())
                .userId(worker.getUser().getId())
                .workerId(worker.getUser().getWorkerId())
                .fullName(worker.getFullName())
                .profilePictureUrl(worker.getProfilePictureUrl())
                .primarySkill(primarySkill)
                .experienceYears(worker.getExperienceYears())
                .hourlyRate(worker.getHourlyRate())
                .city(worker.getCity())
                .state(worker.getState())
                .isAvailable(worker.getIsAvailable())
                .isVerified(worker.getIsVerified())
                .averageRating(worker.getAverageRating())
                .totalReviews(worker.getTotalReviews())
                .totalJobsCompleted(worker.getTotalJobsCompleted())
                .distance(distance)
                .build();
    }

    private BookingCardDTO mapBookingToCardDTO(Booking booking) {
        return BookingCardDTO.builder()
                .id(booking.getId())
                .workerName(booking.getWorker().getFullName())
                .workerProfilePicture(booking.getWorker().getProfilePictureUrl())
                .categoryName(booking.getCategory().getName())
                .serviceTitle(booking.getServiceTitle())
                .scheduledDate(booking.getScheduledDate())
                .scheduledTime(booking.getScheduledTime())
                .estimatedDuration(booking.getEstimatedDuration())
                .estimatedCost(booking.getEstimatedCost())
                .status(booking.getStatus().name())
                .paymentStatus(booking.getPaymentStatus().name())
                .createdAt(booking.getCreatedAt())
                .build();
    }

    private BookingDetailResponse mapBookingToDetailResponse(Booking booking) {
        return BookingDetailResponse.builder()
                .id(booking.getId())
                .consumerName(booking.getConsumer().getFullName())
                .consumerPhone(booking.getConsumer().getPhoneNumber())
                .workerName(booking.getWorker().getFullName())
                .workerPhone(booking.getWorker().getPhoneNumber())
                .workerProfilePicture(booking.getWorker().getProfilePictureUrl())
                .categoryName(booking.getCategory().getName())
                .serviceTitle(booking.getServiceTitle())
                .serviceDescription(booking.getServiceDescription())
                .scheduledDate(booking.getScheduledDate())
                .scheduledTime(booking.getScheduledTime())
                .estimatedDuration(booking.getEstimatedDuration())
                .address(booking.getAddress())
                .city(booking.getCity())
                .state(booking.getState())
                .pincode(booking.getPincode())
                .hourlyRate(booking.getHourlyRate())
                .estimatedCost(booking.getEstimatedCost())
                .actualCost(booking.getActualCost())
                .status(booking.getStatus().name())
                .paymentStatus(booking.getPaymentStatus().name())
                .cancellationReason(booking.getCancellationReason())
                .cancelledBy(booking.getCancelledBy())
                .hasReview(booking.getReview() != null)
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .confirmedAt(booking.getConfirmedAt())
                .completedAt(booking.getCompletedAt())
                .cancelledAt(booking.getCancelledAt())
                .build();
    }

    private WorkerSkillDTO mapWorkerSkillToDTO(WorkerSkill skill) {
        return WorkerSkillDTO.builder()
                .id(skill.getId())
                .categoryId(skill.getCategory().getId())
                .categoryName(skill.getCategory().getName())
                .categoryDescription(skill.getCategory().getDescription())
                .categoryIcon(skill.getCategory().getIconUrl())
                .proficiencyLevel(skill.getProficiencyLevel().name())
                .yearsOfExperience(skill.getYearsOfExperience())
                .isPrimary(skill.getIsPrimary())
                .build();
    }

    private SkillCategoryDTO mapSkillCategoryToDTO(SkillCategory category) {
        return SkillCategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .iconUrl(category.getIconUrl())
                .isActive(category.getIsActive())
                .build();
    }

    private ReviewDTO mapReviewToDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .consumerName(review.getConsumer().getFullName())
                .consumerProfilePicture(review.getConsumer().getProfilePictureUrl())
                .rating(review.getRating())
                .comment(review.getComment())
                .isVerified(review.getIsVerified())
                .helpfulCount(review.getHelpfulCount())
                .createdAt(review.getCreatedAt())
                .build();
    }

    private Double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        final int EARTH_RADIUS_KM = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    @Transactional
    public void ensureConsumerProfile(Long userId, String name) {
        if (consumerProfileRepository.findByUserId(userId).isEmpty()) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            ConsumerProfile profile = ConsumerProfile.builder()
                    .user(user)
                    .fullName(name != null ? name : user.getEmail())
                    .totalBookings(0)
                    .totalReviewsGiven(0)
                    .build();
            consumerProfileRepository.save(profile);
        }
    }
}