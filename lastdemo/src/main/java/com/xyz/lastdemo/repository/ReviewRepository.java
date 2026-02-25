package com.xyz.lastdemo.repository;

import com.xyz.lastdemo.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByWorkerIdOrderByCreatedAtDesc(Long workerId, Pageable pageable);
    List<Review> findTop5ByWorkerIdOrderByCreatedAtDesc(Long workerId);
    List<Review> findByWorkerId(Long workerId);

    List<Review> findByConsumerId(Long consumerId);

    Integer countByWorkerIdAndRating(Long workerId, Integer rating);

    boolean existsByBookingId(Long bookingId);
}
