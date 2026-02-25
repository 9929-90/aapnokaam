package com.xyz.lastdemo.repository;

import com.xyz.lastdemo.entity.WorkerSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerSkillRepository extends JpaRepository<WorkerSkill, Long> {
    List<WorkerSkill> findByWorkerId(Long workerId);
    Optional<WorkerSkill> findByWorkerIdAndCategoryId(Long workerId, Long categoryId);
    void deleteByWorkerIdAndCategoryId(Long workerId, Long categoryId);

    @Query("SELECT ws FROM WorkerSkill ws WHERE ws.worker.id = :workerId AND ws.isPrimary = true")
    List<WorkerSkill> findPrimarySkillsByWorkerId(@Param("workerId") Long workerId);
}
