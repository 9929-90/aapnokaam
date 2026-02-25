package com.xyz.lastdemo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Typing Indicator Payload for WebSocket
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypingIndicatorPayload {
    private Long conversationId;
    private Boolean isTyping;
}