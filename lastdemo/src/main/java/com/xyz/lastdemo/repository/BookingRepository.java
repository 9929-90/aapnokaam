package com.xyz.lastdemo.repository;

import com.xyz.lastdemo.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // ───────────────────────────────────────────────
    // Consumer-related queries
    // ───────────────────────────────────────────────
    Page<Booking> findByConsumerId(Long consumerId, Pageable pageable);

    Page<Booking> findByConsumerIdAndStatus(Long consumerId, Booking.BookingStatus status, Pageable pageable);

    List<Booking> findTop5ByConsumerIdOrderByCreatedAtDesc(Long consumerId);

    long countByConsumerId(Long consumerId);

    long countByConsumerIdAndStatus(Long consumerId, Booking.BookingStatus status);

    @Query("""
        SELECT COALESCE(SUM(b.actualCost), 0)
        FROM Booking b
        WHERE b.consumer.id = :consumerId
          AND b.status = 'COMPLETED'
          AND b.paymentStatus = 'PAID'
    """)
    BigDecimal calculateTotalSpentByConsumer(@Param("consumerId") Long consumerId);

    // ───────────────────────────────────────────────
    // Worker-related queries
    // ───────────────────────────────────────────────
    Page<Booking> findByWorkerId(Long workerId, Pageable pageable);

    Page<Booking> findByWorkerIdAndStatus(Long workerId, Booking.BookingStatus status, Pageable pageable);

    List<Booking> findTop5ByWorkerIdOrderByCreatedAtDesc(Long workerId);

    long countByWorkerId(Long workerId);

    long countByWorkerIdAndStatus(Long workerId, Booking.BookingStatus status);

    @Query("""
        SELECT COALESCE(SUM(b.actualCost), 0)
        FROM Booking b
        WHERE b.worker.id = :workerId
          AND b.status = 'COMPLETED'
          AND b.paymentStatus = 'PAID'
    """)
    BigDecimal calculateTotalEarnedByWorker(@Param("workerId") Long workerId);

    // ───────────────────────────────────────────────
    // Conflict detection (used when creating bookings)
    // ───────────────────────────────────────────────
    @Query("""
    SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END
    FROM Booking b
    WHERE b.worker.id = :workerId
    AND b.status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS')
    AND b.scheduledTime < :endTime
    AND :startTime < b.completedAt
    """)
    boolean existsConflictingBooking(
            @Param("workerId") Long workerId,
            @Param("scheduledDate") LocalDateTime scheduledDate,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    // ───────────────────────────────────────────────
    // Dashboard / Stats - period-based earnings
    // ───────────────────────────────────────────────
    @Query("""
        SELECT COALESCE(SUM(b.actualCost), 0)
        FROM Booking b
        WHERE b.worker.id = :workerId
          AND b.status = 'COMPLETED'
          AND b.paymentStatus = 'PAID'
          AND b.completedAt >= :start
          AND b.completedAt <= :end
    """)
    BigDecimal calculateEarningsByWorkerAndPeriod(
            @Param("workerId") Long workerId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
        SELECT COUNT(b)
        FROM Booking b
        WHERE b.worker.id = :workerId
          AND b.status = 'COMPLETED'
          AND b.completedAt >= :start
    """)
    int countCompletedJobsByWorkerSince(
            @Param("workerId") Long workerId,
            @Param("start") LocalDateTime start
    );

    long countByStatus(Booking.BookingStatus status);

    List<Booking> findByStatus(Booking.BookingStatus status);

    Page<Booking> findByStatus(Booking.BookingStatus status, Pageable pageable);


    // ───────────────────────────────────────────────
    // Utility / Optional helpers
    // ───────────────────────────────────────────────
    Optional<Booking> findByIdAndConsumerId(Long id, Long consumerId);

    Optional<Booking> findByIdAndWorkerId(Long id, Long workerId);

    boolean existsByConsumerIdAndStatus(Long consumerId, Booking.BookingStatus status);
}