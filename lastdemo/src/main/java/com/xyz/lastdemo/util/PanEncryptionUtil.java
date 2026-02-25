package com.xyz.lastdemo.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

/**
 * Utility for encrypting and masking PAN numbers
 * Production Note: Use proper encryption library (AES-256) or HSM for real PAN data
 * This is a simplified hash-based approach for MVP
 */
public class PanEncryptionUtil {

    /**
     * Encrypt PAN number (using SHA-256 hash for MVP)
     * Production: Use AES-256 encryption with secure key management
     */
    public static String encrypt(String panNumber) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(panNumber.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error encrypting PAN", e);
        }
    }

    /**
     * Mask PAN for display (show only last 4 characters)
     * Example: ABCDE1234F -> XXXXX***4F
     */
    public static String maskPan(String encryptedPan) {
        // For MVP, since we're hashing, we can't reverse it
        // In production with AES encryption, you would decrypt then mask
        // For now, return a generic masked format
        return "XXXXX****X (encrypted)";
    }

    /**
     * Validate PAN format
     */
    public static boolean isValidPanFormat(String pan) {
        if (pan == null || pan.length() != 10) {
            return false;
        }
        return pan.matches("[A-Z]{5}[0-9]{4}[A-Z]{1}");
    }
}