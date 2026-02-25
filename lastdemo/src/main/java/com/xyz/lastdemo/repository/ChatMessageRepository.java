package com.xyz.lastdemo.repository;

import com.xyz.lastdemo.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    Page<ChatMessage> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);

    @Query("SELECT COUNT(cm) FROM ChatMessage cm WHERE cm.conversation.id = :conversationId AND cm.sender.id != :userId AND cm.isRead = false")
    Integer countUnreadMessagesInConversation(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
}