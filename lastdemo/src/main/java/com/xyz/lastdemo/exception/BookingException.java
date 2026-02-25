package com.xyz.lastdemo.exception;

/**
 * Exception thrown for booking-related errors
 */
public class BookingException extends RuntimeException {
    public BookingException(String message) {
        super(message);
    }
}