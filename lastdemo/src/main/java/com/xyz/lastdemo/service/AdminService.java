package com.xyz.lastdemo.service;

import com.xyz.lastdemo.dto.*;
import com.xyz.lastdemo.entity.*;
import com.xyz.lastdemo.exception.ResourceNotFoundException;
import com.xyz.lastdemo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin Service
 * Full visibility into users, bookings, payments, and system stats
 * Updated with production-grade search functionality
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;

    // ──────────────────────────────────────────────
    // STATS
    // ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AdminStatsDTO getSystemStats() {

        // User counts
        long totalUsers    = userRepository.count();
        long totalWorkers  = userRepository.findByRole(UserRole.WORKER).size();
        long totalConsumers= userRepository.findByRole(UserRole.CONSUMER).size();
        long pendingApprovals = userRepository.findByRoleAndWorkerApprovedFalse(UserRole.WORKER).size();
        long activeWorkers = totalWorkers - pendingApprovals;

        // Booking counts
        long totalBookings     = bookingRepository.count();
        long pendingBookings   = bookingRepository.countByStatus(Booking.BookingStatus.PENDING);
        long confirmedBookings = bookingRepository.countByStatus(Booking.BookingStatus.CONFIRMED);
        long inProgressBookings= bookingRepository.countByStatus(Booking.BookingStatus.IN_PROGRESS);
        long completedBookings = bookingRepository.countByStatus(Booking.BookingStatus.COMPLETED);
        long cancelledBookings = bookingRepository.countByStatus(Booking.BookingStatus.CANCELLED);

        // Payment stats
        List<Payment> allPayments = paymentRepository.findAll();
        long totalPayments      = allPayments.size();
        long successfulPayments = allPayments.stream().filter(p -> p.getStatus() == PaymentStatus.SUCCESS).count();
        long failedPayments     = allPayments.stream().filter(p -> p.getStatus() == PaymentStatus.FAILED).count();

        BigDecimal totalRevenue = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Revenue this month
        LocalDateTime startOfMonth = LocalDateTime.now().with(TemporalAdjusters.firstDayOfMonth()).toLocalDate().atStartOfDay();
        BigDecimal revenueThisMonth = allPayments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS
                        && p.getPaidAt() != null
                        && p.getPaidAt().isAfter(startOfMonth))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return AdminStatsDTO.builder()
                .totalUsers(totalUsers)
                .totalConsumers(totalConsumers)
                .totalWorkers(totalWorkers)
                .pendingWorkerApprovals(pendingApprovals)
                .activeWorkers(activeWorkers)
                .totalBookings(totalBookings)
                .pendingBookings(pendingBookings)
                .confirmedBookings(confirmedBookings)
                .inProgressBookings(inProgressBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .totalRevenue(totalRevenue)
                .revenueThisMonth(revenueThisMonth)
                .totalPayments(totalPayments)
                .successfulPayments(successfulPayments)
                .failedPayments(failedPayments)
                .build();
    }

    // ──────────────────────────────────────────────
    // USER MANAGEMENT WITH SEARCH
    // ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<AdminUserDTO> getAllUsers(int page, int size, String role, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        List<User> allUsers;

        // Apply role filter first
        if (role != null && !role.isBlank()) {
            try {
                UserRole userRole = UserRole.valueOf(role.toUpperCase());
                allUsers = userRepository.findByRole(userRole);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid role filter: {}", role);
                allUsers = userRepository.findAll();
            }
        } else {
            allUsers = userRepository.findAll();
        }

        // Apply search filter if provided
        List<User> filteredUsers = allUsers;
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.trim().toLowerCase();
            filteredUsers = allUsers.stream()
                    .filter(user -> matchesUserSearchCriteria(user, searchLower))
                    .collect(Collectors.toList());
        }

        // Manual pagination
        int start = Math.min((int) pageable.getOffset(), filteredUsers.size());
        int end = Math.min((start + pageable.getPageSize()), filteredUsers.size());
        List<User> pageContent = filteredUsers.subList(start, end);

        List<AdminUserDTO> dtos = pageContent.stream()
                .map(this::mapUserToAdminDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, filteredUsers.size());
    }

    /**
     * Helper method to check if user matches search criteria
     */
    private boolean matchesUserSearchCriteria(User user, String searchLower) {
        if (user.getEmail() != null && user.getEmail().toLowerCase().contains(searchLower)) {
            return true;
        }
        if (user.getUsername() != null && user.getUsername().toLowerCase().contains(searchLower)) {
            return true;
        }
        if (user.getName() != null && user.getName().toLowerCase().contains(searchLower)) {
            return true;
        }
        if (user.getPhone() != null && user.getPhone().contains(searchLower)) {
            return true;
        }
        return false;
    }

    @Transactional(readOnly = true)
    public AdminUserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return mapUserToAdminDTO(user);
    }

    @Transactional
    public MessageResponse toggleUserEnabled(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        String action = user.isEnabled() ? "enabled" : "disabled";
        log.info("Admin {} user account: {}", action, userId);
        return MessageResponse.builder().message("User account " + action + " successfully").success(true).build();
    }

    // ──────────────────────────────────────────────
    // BOOKING MANAGEMENT WITH SEARCH
    // ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<AdminBookingDTO> getAllBookings(int page, int size, String status, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        List<Booking> allBookings;

        // Apply status filter first
        if (status != null && !status.isBlank()) {
            try {
                Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
                allBookings = bookingRepository.findAll().stream()
                        .filter(b -> b.getStatus() == bookingStatus)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid booking status filter: {}", status);
                allBookings = bookingRepository.findAll();
            }
        } else {
            allBookings = bookingRepository.findAll();
        }

        // Apply search filter if provided
        List<Booking> filteredBookings = allBookings;
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.trim().toLowerCase();
            filteredBookings = allBookings.stream()
                    .filter(booking -> matchesBookingSearchCriteria(booking, searchLower))
                    .collect(Collectors.toList());
        }

        // Sort by createdAt descending
        filteredBookings.sort((b1, b2) -> b2.getCreatedAt().compareTo(b1.getCreatedAt()));

        // Manual pagination
        int start = Math.min((int) pageable.getOffset(), filteredBookings.size());
        int end = Math.min((start + pageable.getPageSize()), filteredBookings.size());
        List<Booking> pageContent = filteredBookings.subList(start, end);

        List<AdminBookingDTO> dtos = pageContent.stream()
                .map(this::mapBookingToAdminDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, filteredBookings.size());
    }

    /**
     * Helper method to check if booking matches search criteria
     */
    private boolean matchesBookingSearchCriteria(Booking booking, String searchLower) {
        if (booking.getServiceTitle() != null && booking.getServiceTitle().toLowerCase().contains(searchLower)) {
            return true;
        }
        if (booking.getConsumer() != null && booking.getConsumer().getFullName() != null
                && booking.getConsumer().getFullName().toLowerCase().contains(searchLower)) {
            return true;
        }
        if (booking.getWorker() != null && booking.getWorker().getFullName() != null
                && booking.getWorker().getFullName().toLowerCase().contains(searchLower)) {
            return true;
        }
        if (booking.getConsumer() != null && booking.getConsumer().getUser() != null
                && booking.getConsumer().getUser().getEmail() != null
                && booking.getConsumer().getUser().getEmail().toLowerCase().contains(searchLower)) {
            return true;
        }
        if (booking.getWorker() != null && booking.getWorker().getUser() != null
                && booking.getWorker().getUser().getEmail() != null
                && booking.getWorker().getUser().getEmail().toLowerCase().contains(searchLower)) {
            return true;
        }
        if (booking.getCity() != null && booking.getCity().toLowerCase().contains(searchLower)) {
            return true;
        }
        if (booking.getId() != null && booking.getId().toString().contains(searchLower)) {
            return true;
        }
        return false;
    }

    @Transactional(readOnly = true)
    public AdminBookingDTO getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));
        return mapBookingToAdminDTO(booking);
    }

    @Transactional
    public MessageResponse cancelBooking(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (booking.getStatus() == Booking.BookingStatus.COMPLETED
                || booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            return MessageResponse.builder()
                    .message("Cannot cancel a booking that is already " + booking.getStatus())
                    .success(false).build();
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancellationReason(reason != null ? reason : "Cancelled by admin");
        booking.setCancelledBy("ADMIN");
        booking.setCancelledAt(LocalDateTime.now());
        bookingRepository.save(booking);

        // Notify consumer
        User consumer = booking.getConsumer().getUser();
        notificationService.createNotification(
                consumer,
                "Booking Cancelled",
                "Your booking '" + booking.getServiceTitle() + "' was cancelled by admin. Reason: " + booking.getCancellationReason(),
                Notification.NotificationType.BOOKING_CANCELLED,
                booking.getId(),
                "/consumer/bookings/" + booking.getId()
        );

        // Notify worker
        User worker = booking.getWorker().getUser();
        notificationService.createNotification(
                worker,
                "Booking Cancelled",
                "Booking '" + booking.getServiceTitle() + "' was cancelled by admin.",
                Notification.NotificationType.BOOKING_CANCELLED,
                booking.getId(),
                "/worker/bookings/" + booking.getId()
        );

        log.info("Admin cancelled booking {}: {}", bookingId, reason);
        return MessageResponse.builder().message("Booking cancelled successfully").success(true).build();
    }

    // ──────────────────────────────────────────────
    // PAYMENT MANAGEMENT WITH SEARCH
    // ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<AdminPaymentDTO> getAllPayments(int page, int size, String status, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        List<Payment> allPayments;

        // Apply status filter first
        if (status != null && !status.isBlank()) {
            try {
                PaymentStatus paymentStatus = PaymentStatus.valueOf(status.toUpperCase());
                allPayments = paymentRepository.findAll().stream()
                        .filter(p -> p.getStatus() == paymentStatus)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid payment status filter: {}", status);
                allPayments = paymentRepository.findAll();
            }
        } else {
            allPayments = paymentRepository.findAll();
        }

        // Apply search filter if provided
        List<Payment> filteredPayments = allPayments;
        if (search != null && !search.trim().isEmpty()) {
            String searchLower = search.trim().toLowerCase();
            filteredPayments = allPayments.stream()
                    .filter(payment -> matchesPaymentSearchCriteria(payment, searchLower))
                    .collect(Collectors.toList());
        }

        // Sort by createdAt descending
        filteredPayments.sort((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()));

        // Manual pagination
        int start = Math.min((int) pageable.getOffset(), filteredPayments.size());
        int end = Math.min((start + pageable.getPageSize()), filteredPayments.size());
        List<Payment> pageContent = filteredPayments.subList(start, end);

        List<AdminPaymentDTO> dtos = pageContent.stream()
                .map(this::mapPaymentToAdminDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, filteredPayments.size());
    }

    /**
     * Helper method to check if payment matches search criteria
     */
    private boolean matchesPaymentSearchCriteria(Payment payment, String searchLower) {
        Booking booking = payment.getBooking();

        if (booking != null && booking.getServiceTitle() != null
                && booking.getServiceTitle().toLowerCase().contains(searchLower)) {
            return true;
        }
        if (booking != null && booking.getConsumer() != null
                && booking.getConsumer().getFullName() != null
                && booking.getConsumer().getFullName().toLowerCase().contains(searchLower)) {
            return true;
        }
        if (booking != null && booking.getConsumer() != null
                && booking.getConsumer().getUser() != null
                && booking.getConsumer().getUser().getEmail() != null
                && booking.getConsumer().getUser().getEmail().toLowerCase().contains(searchLower)) {
            return true;
        }
        if (payment.getRazorpayOrderId() != null
                && payment.getRazorpayOrderId().toLowerCase().contains(searchLower)) {
            return true;
        }
        if (payment.getRazorpayPaymentId() != null
                && payment.getRazorpayPaymentId().toLowerCase().contains(searchLower)) {
            return true;
        }
        if (payment.getId() != null && payment.getId().toString().contains(searchLower)) {
            return true;
        }
        if (booking != null && booking.getId() != null
                && booking.getId().toString().contains(searchLower)) {
            return true;
        }
        return false;
    }

    // ──────────────────────────────────────────────
    // NOTIFICATIONS
    // ──────────────────────────────────────────────

    @Transactional
    public MessageResponse sendNotificationToUser(Long userId, String title, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        notificationService.createNotification(
                user, title, message,
                Notification.NotificationType.SYSTEM_ANNOUNCEMENT,
                null, null
        );

        log.info("Admin sent notification to user {}: {}", userId, title);
        return MessageResponse.builder().message("Notification sent successfully").success(true).build();
    }

    // ──────────────────────────────────────────────
    // MAPPING HELPERS
    // ──────────────────────────────────────────────

    private AdminUserDTO mapUserToAdminDTO(User user) {
        AdminUserDTO.AdminUserDTOBuilder builder = AdminUserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .name(user.getName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .enabled(user.isEnabled())
                .emailVerified(user.isEmailVerified())
                .workerApproved(user.isWorkerApproved())
                .createdAt(user.getCreatedAt());

        // Consumer extra info
        if (user.getRole() == UserRole.CONSUMER) {
            builder.consumerFullName(user.getName())
                    .totalBookings(
                            bookingRepository.countByConsumerId(user.getId())
                    );
        }

        // Worker extra info
        if (user.getRole() == UserRole.WORKER) {
            builder.workerFullName(user.getName())
                    .city(null)
                    .averageRating(0.0)
                    .totalJobsCompleted(0)
                    .isAvailable(true)
                    .isVerified(user.isWorkerApproved());
        }

        return builder.build();
    }

    private AdminBookingDTO mapBookingToAdminDTO(Booking booking) {
        ConsumerProfile consumer = booking.getConsumer();
        WorkerProfile worker = booking.getWorker();

        return AdminBookingDTO.builder()
                .id(booking.getId())
                .serviceTitle(booking.getServiceTitle())
                .categoryName(booking.getCategory() != null ? booking.getCategory().getName() : null)
                .consumerId(consumer.getId())
                .consumerName(consumer.getFullName())
                .consumerEmail(consumer.getUser().getEmail())
                .workerId(worker.getId())
                .workerName(worker.getFullName())
                .workerEmail(worker.getUser().getEmail())
                .status(booking.getStatus().name())
                .paymentStatus(booking.getPaymentStatus() != null ? booking.getPaymentStatus().name() : null)
                .estimatedCost(booking.getEstimatedCost())
                .actualCost(booking.getActualCost())
                .totalAmount(booking.getTotalAmount())
                .city(booking.getCity())
                .address(booking.getAddress())
                .scheduledDate(booking.getScheduledDate())
                .createdAt(booking.getCreatedAt())
                .completedAt(booking.getCompletedAt())
                .cancelledAt(booking.getCancelledAt())
                .cancellationReason(booking.getCancellationReason())
                .cancelledBy(booking.getCancelledBy())
                .build();
    }

    private AdminPaymentDTO mapPaymentToAdminDTO(Payment payment) {
        Booking booking = payment.getBooking();
        ConsumerProfile consumer = booking.getConsumer();

        return AdminPaymentDTO.builder()
                .id(payment.getId())
                .bookingId(booking.getId())
                .serviceTitle(booking.getServiceTitle())
                .consumerName(consumer.getFullName())
                .consumerEmail(consumer.getUser().getEmail())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayPaymentId(payment.getRazorpayPaymentId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus().name())
                .failureReason(payment.getFailureReason())
                .createdAt(payment.getCreatedAt())
                .paidAt(payment.getPaidAt())
                .build();
    }
}