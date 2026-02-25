package com.xyz.lastdemo.repository;

import com.xyz.lastdemo.entity.WorkerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkerProfileRepository
        extends JpaRepository<WorkerProfile, Long>,
        JpaSpecificationExecutor<WorkerProfile> {

    Optional<WorkerProfile> findByUserId(Long userId);

    @Query("SELECT COUNT(w) FROM WorkerProfile w WHERE w.isAvailable = true")
    Long countAvailableWorkers();
}
