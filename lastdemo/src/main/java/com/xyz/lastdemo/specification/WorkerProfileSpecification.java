package com.xyz.lastdemo.specification;

import com.xyz.lastdemo.dto.WorkerSearchRequest;
import com.xyz.lastdemo.entity.WorkerProfile;
import com.xyz.lastdemo.entity.WorkerSkill;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Specification for building dynamic queries for worker search
 * UPDATED: Location filters are now optional - only applied when provided
 */
public class WorkerProfileSpecification {

    public static Specification<WorkerProfile> buildSpecification(WorkerSearchRequest request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Worker must be verified and approved (ALWAYS REQUIRED)
            predicates.add(criteriaBuilder.isTrue(root.get("isVerified")));
            predicates.add(criteriaBuilder.isTrue(root.get("user").get("workerApproved")));

            // Filter by category (skill) - OPTIONAL
            if (request.getCategoryId() != null) {
                Join<WorkerProfile, WorkerSkill> skillJoin = root.join("skills", JoinType.INNER);
                predicates.add(criteriaBuilder.equal(
                        skillJoin.get("category").get("id"),
                        request.getCategoryId()
                ));
            }

            // Filter by availability - OPTIONAL
            if (request.getAvailableOnly() != null && request.getAvailableOnly()) {
                predicates.add(criteriaBuilder.isTrue(root.get("isAvailable")));
            }

            // Filter by city - OPTIONAL (Udaipur filter)
            if (request.getCity() != null && !request.getCity().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("city")),
                        request.getCity().toLowerCase()
                ));
            }

            // Filter by state - OPTIONAL (Rajasthan filter)
            if (request.getState() != null && !request.getState().isEmpty()) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("state")),
                        request.getState().toLowerCase()
                ));
            }

            // Filter by pincode - OPTIONAL
            if (request.getPincode() != null && !request.getPincode().isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("pincode"), request.getPincode()));
            }

            // Filter by location radius - OPTIONAL (if lat/lon provided)
            if (request.getLatitude() != null && request.getLongitude() != null && request.getRadiusKm() != null) {
                // Using Haversine formula for distance calculation
                Expression<Double> distance = criteriaBuilder.function(
                        "ACOS",
                        Double.class,
                        criteriaBuilder.sum(
                                criteriaBuilder.prod(
                                        criteriaBuilder.function("SIN", Double.class,
                                                criteriaBuilder.function("RADIANS", Double.class, root.get("latitude"))),
                                        criteriaBuilder.function("SIN", Double.class,
                                                criteriaBuilder.literal(Math.toRadians(request.getLatitude())))
                                ),
                                criteriaBuilder.prod(
                                        criteriaBuilder.function("COS", Double.class,
                                                criteriaBuilder.function("RADIANS", Double.class, root.get("latitude"))),
                                        criteriaBuilder.prod(
                                                criteriaBuilder.function("COS", Double.class,
                                                        criteriaBuilder.literal(Math.toRadians(request.getLatitude()))),
                                                criteriaBuilder.function("COS", Double.class,
                                                        criteriaBuilder.diff(
                                                                criteriaBuilder.function("RADIANS", Double.class, root.get("longitude")),
                                                                criteriaBuilder.literal(Math.toRadians(request.getLongitude()))
                                                        )
                                                )
                                        )
                                )
                        )
                );

                Expression<Double> distanceInKm = criteriaBuilder.prod(distance, 6371.0);
                predicates.add(criteriaBuilder.lessThanOrEqualTo(distanceInKm, request.getRadiusKm()));
            }

            // Filter by minimum rating - OPTIONAL
            if (request.getMinRating() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("averageRating"),
                        request.getMinRating()
                ));
            }

            // Filter by maximum hourly rate - OPTIONAL
            if (request.getMaxHourlyRate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("hourlyRate"),
                        request.getMaxHourlyRate()
                ));
            }

            // Remove duplicates if joining with skills
            if (request.getCategoryId() != null) {
                query.distinct(true);
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}