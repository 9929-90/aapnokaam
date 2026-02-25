package com.xyz.lastdemo.repository;

import com.xyz.lastdemo.entity.Payment;
import com.xyz.lastdemo.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Find payment by Razorpay order ID (used during verification)
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    // Find payment by booking ID (used to check if a booking already has a payment)
    Optional<Payment> findByBookingId(Long bookingId);

    // Find payment by booking ID and a specific status
    Optional<Payment> findByBookingIdAndStatus(Long bookingId, PaymentStatus status);

    // Check if a booking already has a successful payment
    boolean existsByBookingIdAndStatus(Long bookingId, PaymentStatus status);
}