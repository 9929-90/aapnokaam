package com.xyz.lastdemo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Simple API response wrapper for contact form submissions.
 */
@Data
@AllArgsConstructor
public class ContactResponse {
    private boolean success;
    private String message;
}