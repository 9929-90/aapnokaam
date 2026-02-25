package com.xyz.lastdemo.controller;

import com.xyz.lastdemo.dto.*;
import com.xyz.lastdemo.entity.User;
import com.xyz.lastdemo.service.ChatService;
import com.xyz.lastdemo.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Chat Controller
 * Handles messaging between workers and consumers
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    /**
     * Helper method to extract logged-in user
     */
    private User getCurrentUser(Authentication authentication) {
        String email = authentication.getName(); // from JWT
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Get all conversations for current user
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getConversations(
            Authentication authentication) {

        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(chatService.getUserConversations(user.getId()));
    }

    /**
     * Get messages for a specific conversation
     */
    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<ChatMessageDTO>> getMessages(
            Authentication authentication,
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(
                chatService.getConversationMessages(user.getId(), conversationId, page, size));
    }

    /**
     * Send a message (REST endpoint)
     */
    @PostMapping("/messages")
    public ResponseEntity<ChatMessageDTO> sendMessage(
            Authentication authentication,
            @Valid @RequestBody SendMessageRequest request) {

        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(chatService.sendMessage(user.getId(), request));
    }

    /**
     * Mark messages as read
     */
    @PutMapping("/conversations/{conversationId}/read")
    public ResponseEntity<MessageResponse> markAsRead(
            Authentication authentication,
            @PathVariable Long conversationId) {

        User user = getCurrentUser(authentication);
        chatService.markConversationAsRead(user.getId(), conversationId);

        return ResponseEntity.ok(MessageResponse.builder()
                .success(true)
                .message("Messages marked as read")
                .build());
    }

    /**
     * Get unread message count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(
            Authentication authentication) {

        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(chatService.getUnreadCount(user.getId()));
    }

    /**
     * WebSocket: Send message
     */
    @MessageMapping("/chat.send")
    public void handleWebSocketMessage(
            @Payload ChatMessagePayload payload,
            SimpMessageHeaderAccessor headerAccessor) {

        Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");

        if (userId == null) {
            throw new RuntimeException("User not authenticated in WebSocket session");
        }

        chatService.handleWebSocketMessage(userId, payload);
    }

    /**
     * WebSocket: User typing indicator
     */
    @MessageMapping("/chat.typing")
    public void handleTypingIndicator(
            @Payload TypingIndicatorPayload payload,
            SimpMessageHeaderAccessor headerAccessor) {

        Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");

        if (userId == null) {
            throw new RuntimeException("User not authenticated in WebSocket session");
        }

        chatService.handleTypingIndicator(userId, payload);
    }
}
