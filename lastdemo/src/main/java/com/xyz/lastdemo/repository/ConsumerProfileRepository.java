package com.xyz.lastdemo.repository;

import com.xyz.lastdemo.entity.ConsumerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConsumerProfileRepository extends JpaRepository<ConsumerProfile, Long> {
    Optional<ConsumerProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
