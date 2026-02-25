package com.xyz.lastdemo.repository;

import com.xyz.lastdemo.entity.FavoriteWorker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteWorkerRepository extends JpaRepository<FavoriteWorker, Long> {

    List<FavoriteWorker> findByConsumerId(Long consumerId);
    Optional<FavoriteWorker> findByConsumerIdAndWorkerId(Long consumerId, Long workerId);
    boolean existsByConsumerIdAndWorkerId(Long consumerId, Long workerId);
    Integer countByConsumerId(Long consumerId);
    void deleteByConsumerIdAndWorkerId(Long consumerId, Long workerId);
}
