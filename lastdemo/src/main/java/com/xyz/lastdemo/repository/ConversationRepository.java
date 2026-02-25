package com.xyz.lastdemo.repository;

import com.xyz.lastdemo.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    @Query("SELECT c FROM Conversation c WHERE (c.worker.id = :userId OR c.consumer.id = :userId) AND c.isActive = true ORDER BY c.lastMessageAt DESC")
    List<Conversation> findUserConversations(@Param("userId") Long userId);

    Optional<Conversation> findByWorkerIdAndConsumerId(Long workerId, Long consumerId);

    @Query("SELECT COUNT(c) FROM Conversation c WHERE c.worker.id = :workerId AND c.workerUnreadCount > 0")
    Integer countUnreadConversationsForWorker(@Param("workerId") Long workerId);

    @Query("SELECT COUNT(c) FROM Conversation c WHERE c.consumer.id = :consumerId AND c.consumerUnreadCount > 0")
    Integer countUnreadConversationsForConsumer(@Param("consumerId") Long consumerId);
}