package com.xyz.lastdemo.entity;

/**
 * User role enumeration for RBAC
 * Three distinct roles with different access levels and workflows
 */
public enum UserRole {
    ADMIN,      // Full system access, can approve workers
    CONSUMER,   // Standard user, email verification required
    WORKER      // Requires PAN verification + admin approval
}