package com.xyz.lastdemo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Chat Message Payload for WebSocket
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessagePayload {
    private Long conversationId;
    private String content;
    private String messageType;
    private String attachmentUrl;
}