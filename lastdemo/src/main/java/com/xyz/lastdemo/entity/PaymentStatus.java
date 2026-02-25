package com.xyz.lastdemo.entity;

public enum PaymentStatus {
    PENDING,    // Order created, payment not yet done
    SUCCESS,    // Payment verified successfully
    FAILED,     // Payment failed or verification failed
    REFUNDED    // Payment refunded (future use)
}