package com.xyz.lastdemo.service;

import com.xyz.lastdemo.dto.*;
import com.xyz.lastdemo.entity.*;
import com.xyz.lastdemo.exception.ResourceNotFoundException;
import com.xyz.lastdemo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Worker Service
 * Handles all business logic for worker operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WorkerService {

    private final WorkerProfileRepository workerProfileRepository;
    private final WorkerSkillRepository workerSkillRepository;
    private final SkillCategoryRepository skillCategoryRepository;
    private final ReviewRepository reviewRepository;
    private final ConversationRepository conversationRepository;
    private final NotificationRepository notificationRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;
    private final BookingRepository bookingRepository;

    /**
     * Get worker dashboard overview
     */
    @Transactional(readOnly = true)
    public WorkerDashboardResponse getWorkerDashboard(Long userId) {
        WorkerProfile profile = getWorkerProfileByUserId(userId);

        Integer unreadMessages = conversationRepository.countUnreadConversationsForWorker(userId);
        Integer unreadNotifications = notificationRepository.countUnreadByUserId(userId);

        List<String> primarySkills = workerSkillRepository.findPrimarySkillsByWorkerId(profile.getId())
                .stream()
                .map(ws -> ws.getCategory().getName())
                .collect(Collectors.toList());

        return WorkerDashboardResponse.builder()
                .workerName(profile.getFullName())
                .workerId(profile.getUser().getWorkerId())
                .isAvailable(profile.getIsAvailable())
                .averageRating(profile.getAverageRating())
                .totalReviews(profile.getTotalReviews())
                .totalJobsCompleted(profile.getTotalJobsCompleted())
                .unreadMessages(unreadMessages)
                .unreadNotifications(unreadNotifications)
                .primarySkills(primarySkills)
                .stats(getWorkerStats(userId))
                .build();
    }

    /**
     * Update worker availability
     */
    @Transactional
    public AvailabilityResponse updateAvailability(Long userId, AvailabilityRequest request) {
        WorkerProfile profile = getWorkerProfileByUserId(userId);
        profile.setIsAvailable(request.getIsAvailable());
        workerProfileRepository.save(profile);

        log.info("Worker {} availability updated to: {}", userId, request.getIsAvailable());

        String message = request.getIsAvailable()
                ? "You are now available for work"
                : "You are now unavailable for work";

        return AvailabilityResponse.builder()
                .isAvailable(request.getIsAvailable())
                .message(message)
                .build();
    }

    /**
     * Get worker profile
     */
    @Transactional(readOnly = true)
    public WorkerProfileResponse getWorkerProfile(Long userId) {
        WorkerProfile profile = getWorkerProfileByUserId(userId);
        List<WorkerSkillDTO> skills = mapWorkerSkillsToDTO(profile.getSkills());

        return WorkerProfileResponse.builder()
                .id(profile.getId())
                .fullName(profile.getFullName())
                .email(profile.getUser().getEmail())
                .phoneNumber(profile.getPhoneNumber())
                .profilePictureUrl(profile.getProfilePictureUrl())
                .bio(profile.getBio())
                .experienceYears(profile.getExperienceYears())
                .hourlyRate(profile.getHourlyRate())
                .address(profile.getAddress())
                .city(profile.getCity())
                .state(profile.getState())
                .pincode(profile.getPincode())
                .latitude(profile.getLatitude())
                .longitude(profile.getLongitude())
                .isAvailable(profile.getIsAvailable())
                .averageRating(profile.getAverageRating())
                .totalReviews(profile.getTotalReviews())
                .totalJobsCompleted(profile.getTotalJobsCompleted())
                .languagesSpoken(profile.getLanguagesSpoken())
                .isVerified(profile.getIsVerified())
                .skills(skills)
                .build();
    }

    /**
     * Update worker profile
     */
    @Transactional
    public MessageResponse updateProfile(Long userId, UpdateWorkerProfileRequest request) {
        WorkerProfile profile = getWorkerProfileByUserId(userId);

        if (request.getFullName() != null) profile.setFullName(request.getFullName());
        if (request.getPhoneNumber() != null) profile.setPhoneNumber(request.getPhoneNumber());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getExperienceYears() != null) profile.setExperienceYears(request.getExperienceYears());
        if (request.getHourlyRate() != null) profile.setHourlyRate(request.getHourlyRate());
        if (request.getAddress() != null) profile.setAddress(request.getAddress());
        if (request.getCity() != null) profile.setCity(request.getCity());
        if (request.getState() != null) profile.setState(request.getState());
        if (request.getPincode() != null) profile.setPincode(request.getPincode());
        if (request.getLanguagesSpoken() != null) profile.setLanguagesSpoken(request.getLanguagesSpoken());
        if (request.getLatitude() != null) profile.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) profile.setLongitude(request.getLongitude());

        workerProfileRepository.save(profile);
        log.info("Worker profile updated for user: {}", userId);

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
        WorkerProfile profile = getWorkerProfileByUserId(userId);

        String imageUrl = fileStorageService.storeFile(file, "profiles");
        profile.setProfilePictureUrl(imageUrl);
        workerProfileRepository.save(profile);

        log.info("Profile picture uploaded for worker: {}", userId);

        return MessageResponse.builder()
                .success(true)
                .message("Profile picture uploaded successfully")
                .build();
    }

    /**
     * Get worker skills
     */
    @Transactional(readOnly = true)
    public List<WorkerSkillDTO> getWorkerSkills(Long userId) {
        WorkerProfile profile = getWorkerProfileByUserId(userId);
        return mapWorkerSkillsToDTO(profile.getSkills());
    }

    /**
     * Update worker skills
     */
    @Transactional
    public MessageResponse updateSkills(Long userId, UpdateSkillsRequest request) {
        WorkerProfile profile = getWorkerProfileByUserId(userId);

        // Remove existing skills
        workerSkillRepository.deleteAll(profile.getSkills());
        profile.getSkills().clear();

        // Add new skills
        for (UpdateSkillsRequest.SkillUpdateItem item : request.getSkills()) {
            SkillCategory category = skillCategoryRepository.findById(item.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Skill category not found"));

            WorkerSkill skill = WorkerSkill.builder()
                    .worker(profile)
                    .category(category)
                    .proficiencyLevel(WorkerSkill.ProficiencyLevel.valueOf(item.getProficiencyLevel()))
                    .yearsOfExperience(item.getYearsOfExperience())
                    .isPrimary(item.getIsPrimary())
                    .build();

            profile.addSkill(skill);
        }

        workerProfileRepository.save(profile);
        log.info("Worker skills updated for user: {}", userId);

        return MessageResponse.builder()
                .success(true)
                .message("Skills updated successfully")
                .build();
    }

    /**
     * Get all available skill categories
     */
    @Transactional(readOnly = true)
    public List<SkillCategoryDTO> getAllSkillCategories() {
        return skillCategoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::mapSkillCategoryToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get worker reviews
     */
    @Transactional(readOnly = true)
    public ReviewSummaryResponse getWorkerReviews(Long userId, int page, int size) {
        WorkerProfile profile = getWorkerProfileByUserId(userId);
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviewPage = reviewRepository.findByWorkerIdOrderByCreatedAtDesc(profile.getId(), pageable);

        List<ReviewDTO> reviews = reviewPage.getContent().stream()
                .map(this::mapReviewToDTO)
                .collect(Collectors.toList());

        ReviewSummaryResponse.RatingDistribution distribution = ReviewSummaryResponse.RatingDistribution.builder()
                .fiveStars(reviewRepository.countByWorkerIdAndRating(profile.getId(), 5))
                .fourStars(reviewRepository.countByWorkerIdAndRating(profile.getId(), 4))
                .threeStars(reviewRepository.countByWorkerIdAndRating(profile.getId(), 3))
                .twoStars(reviewRepository.countByWorkerIdAndRating(profile.getId(), 2))
                .oneStar(reviewRepository.countByWorkerIdAndRating(profile.getId(), 1))
                .build();

        return ReviewSummaryResponse.builder()
                .averageRating(profile.getAverageRating())
                .totalReviews(profile.getTotalReviews())
                .ratingDistribution(distribution)
                .reviews(reviews)
                .currentPage(page)
                .totalPages(reviewPage.getTotalPages())
                .totalElements(reviewPage.getTotalElements())
                .build();
    }

    /**
     * Get worker statistics
     */
    @Transactional(readOnly = true)
    public WorkerStatsResponse getWorkerStats(Long userId) {
        WorkerProfile profile = getWorkerProfileByUserId(userId);

        // TODO: Implement proper calculations
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);


// AFTER (matches repository)
        int jobsThisMonth = bookingRepository.countCompletedJobsByWorkerSince(profile.getId(), monthStart);
        BigDecimal totalEarnings = bookingRepository.calculateTotalEarnedByWorker(profile.getId());
        BigDecimal earningsThisMonth = bookingRepository.calculateEarningsByWorkerAndPeriod(profile.getId(), monthStart, now);
        Integer responseRate = calculateResponseRate(profile.getId());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM yyyy");
        String memberSince = profile.getCreatedAt().format(formatter);

        return WorkerStatsResponse.builder()
                .totalJobsCompleted(profile.getTotalJobsCompleted())
                .jobsThisMonth(jobsThisMonth)
                .totalEarnings(totalEarnings != null ? totalEarnings : BigDecimal.ZERO)
                .earningsThisMonth(earningsThisMonth != null ? earningsThisMonth : BigDecimal.ZERO)
                .averageRating(profile.getAverageRating())
                .totalReviews(profile.getTotalReviews())
                .responseRate(responseRate)
                .memberSince(memberSince)
                .build();
    }

    // Helper methods

    private WorkerProfile getWorkerProfileByUserId(Long userId) {
        return workerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));
    }

    private List<WorkerSkillDTO> mapWorkerSkillsToDTO(List<WorkerSkill> skills) {
        return skills.stream()
                .map(this::mapWorkerSkillToDTO)
                .collect(Collectors.toList());
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
                .consumerProfilePicture(null) // TODO: Get from consumer profile
                .rating(review.getRating())
                .comment(review.getComment())
                .isVerified(review.getIsVerified())
                .helpfulCount(review.getHelpfulCount())
                .createdAt(review.getCreatedAt())
                .build();
    }

    private Integer calculateResponseRate(Long workerId) {
        // TODO: Implement proper calculation
        // Example: average response time < 1 hour = 95%, < 4 hours = 80%, etc.
        return 95;
    }
}