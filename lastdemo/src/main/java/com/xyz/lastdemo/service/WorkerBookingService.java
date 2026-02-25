package com.xyz.lastdemo.service;

import com.xyz.lastdemo.dto.*;
import com.xyz.lastdemo.entity.*;
import com.xyz.lastdemo.exception.BookingException;
import com.xyz.lastdemo.exception.ResourceNotFoundException;
import com.xyz.lastdemo.exception.UnauthorizedException;
import com.xyz.lastdemo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkerBookingService {

    private final WorkerProfileRepository workerProfileRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public BookingListResponse getWorkerBookings(Long userId, String status, int page, int size) {
        WorkerProfile worker = getWorkerProfileByUserId(userId);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Booking> bookingPage;
        if (status != null && !status.isEmpty()) {
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
            bookingPage = bookingRepository.findByWorkerIdAndStatus(worker.getId(), bookingStatus, pageable);
        } else {
            bookingPage = bookingRepository.findByWorkerId(worker.getId(), pageable);
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

    @Transactional(readOnly = true)
    public BookingDetailResponse getBookingDetails(Long userId, Long bookingId) {
        Booking booking = getBookingById(bookingId);
        validateWorkerBooking(userId, booking);
        return mapBookingToDetailResponse(booking);
    }

    @Transactional
    public MessageResponse acceptBooking(Long userId, Long bookingId) {
        Booking booking = getBookingById(bookingId);
        validateWorkerBooking(userId, booking);

        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new BookingException("Only payment-confirmed bookings can be accepted by worker");
        }

        booking.setConfirmedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getConsumer().getUser(),
                "Worker Accepted Your Booking",
                booking.getWorker().getFullName() + " has accepted your booking for " + booking.getServiceTitle(),
                Notification.NotificationType.BOOKING_CONFIRMED,
                booking.getId(),
                "/consumer/bookings/" + booking.getId()
        );

        try {
            emailService.sendBookingConfirmationEmail(
                    booking.getConsumer().getUser().getEmail(),
                    booking.getConsumer().getUser().getName(),
                    booking
            );
        } catch (Exception e) {
            log.error("Failed to send acceptance email for booking {}: {}", bookingId, e.getMessage());
        }

        log.info("Booking {} accepted by worker {}", bookingId, userId);
        return MessageResponse.builder().success(true).message("Booking accepted successfully").build();
    }

    @Transactional
    public MessageResponse rejectBooking(Long userId, Long bookingId, RejectBookingRequest request) {
        Booking booking = getBookingById(bookingId);
        validateWorkerBooking(userId, booking);

        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new BookingException("Only confirmed bookings can be rejected");
        }

        booking.setStatus(Booking.BookingStatus.REJECTED);
        booking.setCancellationReason(request.getReason());
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancelledBy("WORKER");
        bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getConsumer().getUser(),
                "Booking Rejected",
                "Your booking was not accepted. Reason: " + request.getReason(),
                Notification.NotificationType.BOOKING_CANCELLED,
                booking.getId(),
                "/consumer/bookings/" + booking.getId()
        );

        log.info("Booking {} rejected by worker {}", bookingId, userId);
        return MessageResponse.builder().success(true).message("Booking rejected").build();
    }

    @Transactional
    public MessageResponse startBooking(Long userId, Long bookingId) {
        Booking booking = getBookingById(bookingId);
        validateWorkerBooking(userId, booking);

        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new BookingException("Only confirmed bookings can be started");
        }

        booking.setStatus(Booking.BookingStatus.IN_PROGRESS);
        booking.setStartedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getConsumer().getUser(),
                "Work Started",
                booking.getWorker().getFullName() + " has started working on your booking",
                Notification.NotificationType.BOOKING_IN_PROGRESS,
                booking.getId(),
                "/consumer/bookings/" + booking.getId()
        );

        log.info("Booking {} started by worker {}", bookingId, userId);
        return MessageResponse.builder().success(true).message("Work started successfully").build();
    }

    @Transactional
    public MessageResponse completeBooking(Long userId, Long bookingId, CompleteBookingRequest request) {
        Booking booking = getBookingById(bookingId);
        validateWorkerBooking(userId, booking);

        if (booking.getStatus() != Booking.BookingStatus.IN_PROGRESS) {
            throw new BookingException("Only in-progress bookings can be completed");
        }

        if (request.getActualDuration() != null) {
            BigDecimal actualCost = booking.getHourlyRate()
                    .multiply(BigDecimal.valueOf(request.getActualDuration()));
            booking.setActualCost(actualCost);
        } else {
            booking.setActualCost(booking.getEstimatedCost());
        }

        booking.setStatus(Booking.BookingStatus.COMPLETED);
        booking.setCompletedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        WorkerProfile worker = booking.getWorker();
        worker.setTotalJobsCompleted(worker.getTotalJobsCompleted() + 1);
        workerProfileRepository.save(worker);

        notificationService.createNotification(
                booking.getConsumer().getUser(),
                "Work Completed",
                "The work on your booking has been completed. Please leave a review!",
                Notification.NotificationType.BOOKING_COMPLETED,
                booking.getId(),
                "/consumer/bookings/" + booking.getId()
        );

        try {
            emailService.sendJobCompletionEmailToConsumer(
                    booking.getConsumer().getUser().getEmail(),
                    booking.getConsumer().getUser().getName(),
                    booking
            );
            emailService.sendJobCompletionEmailToWorker(
                    booking.getWorker().getUser().getEmail(),
                    booking.getWorker().getUser().getName(),
                    booking
            );
        } catch (Exception e) {
            log.error("Failed to send completion emails for booking {}: {}", bookingId, e.getMessage());
        }

        log.info("Booking {} completed by worker {}", bookingId, userId);
        return MessageResponse.builder().success(true).message("Booking marked as completed").build();
    }

    @Transactional
    public MessageResponse cancelBooking(Long userId, Long bookingId, CancelBookingRequest request) {
        Booking booking = getBookingById(bookingId);
        validateWorkerBooking(userId, booking);

        if (booking.getStatus() == Booking.BookingStatus.COMPLETED ||
                booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BookingException("Cannot cancel a " + booking.getStatus().name().toLowerCase() + " booking");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancellationReason(request.getReason());
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancelledBy("WORKER");
        bookingRepository.save(booking);

        notificationService.createNotification(
                booking.getConsumer().getUser(),
                "Booking Cancelled",
                "Your booking has been cancelled by the worker. Reason: " + request.getReason(),
                Notification.NotificationType.BOOKING_CANCELLED,
                booking.getId(),
                "/consumer/bookings/" + booking.getId()
        );

        log.info("Booking {} cancelled by worker {}", bookingId, userId);
        return MessageResponse.builder().success(true).message("Booking cancelled successfully").build();
    }

    // ── Helpers ──────────────────────────────────────────────────

    private WorkerProfile getWorkerProfileByUserId(Long userId) {
        return workerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found"));
    }

    private Booking getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    private void validateWorkerBooking(Long userId, Booking booking) {
        if (!booking.getWorker().getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to access this booking");
        }
    }

    private BookingCardDTO mapBookingToCardDTO(Booking booking) {
        return BookingCardDTO.builder()
                .id(booking.getId())
                .workerName(booking.getConsumer().getFullName())
                .workerProfilePicture(booking.getConsumer().getProfilePictureUrl())
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
}