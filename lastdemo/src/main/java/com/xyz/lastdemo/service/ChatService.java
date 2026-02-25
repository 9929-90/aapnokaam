package com.xyz.lastdemo.service;

import com.xyz.lastdemo.dto.*;
import com.xyz.lastdemo.entity.*;
import com.xyz.lastdemo.exception.ResourceNotFoundException;
import com.xyz.lastdemo.exception.UnauthorizedException;
import com.xyz.lastdemo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Chat Service
 * Handles real-time messaging between workers and consumers
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Get all conversations for a user
     */
    @Transactional(readOnly = true)
    public List<ConversationDTO> getUserConversations(Long userId) {
        User user = getUserById(userId);
        List<Conversation> conversations = conversationRepository.findUserConversations(userId);

        return conversations.stream()
                .map(conv -> mapConversationToDTO(conv, user))
                .collect(Collectors.toList());
    }

    /**
     * Get messages for a conversation
     */
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getConversationMessages(Long userId, Long conversationId, int page, int size) {
        Conversation conversation = getConversationById(conversationId);
        validateUserInConversation(userId, conversation);

        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessage> messagePage = chatMessageRepository
                .findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);

        return messagePage.getContent().stream()
                .map(this::mapChatMessageToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Send a message via REST
     */
    @Transactional
    public ChatMessageDTO sendMessage(Long userId, SendMessageRequest request) {
        User sender = getUserById(userId);
        Conversation conversation = getConversationById(request.getConversationId());
        validateUserInConversation(userId, conversation);

        ChatMessage message = createChatMessage(sender, conversation, request);
        chatMessageRepository.save(message);

        // Update conversation
        updateConversationAfterMessage(conversation, message, userId);

        // Send real-time notification via WebSocket
        ChatMessageDTO messageDTO = mapChatMessageToDTO(message);
        sendMessageViaWebSocket(conversation, messageDTO);

        // Send push notification to recipient
        User recipient = getRecipientUser(conversation, userId);
        notifyRecipient(recipient, sender, message);

        log.info("Message sent from user {} in conversation {}", userId, conversation.getId());

        return messageDTO;
    }

    /**
     * Handle WebSocket message
     */
    @Transactional
    public void handleWebSocketMessage(Long userId, ChatMessagePayload payload) {
        try {
            SendMessageRequest request = new SendMessageRequest();
            request.setConversationId(payload.getConversationId());
            request.setContent(payload.getContent());
            request.setMessageType(payload.getMessageType());
            request.setAttachmentUrl(payload.getAttachmentUrl());

            sendMessage(userId, request);
        } catch (Exception e) {
            log.error("Error handling WebSocket message: {}", e.getMessage());
        }
    }

    /**
     * Handle typing indicator
     */
    public void handleTypingIndicator(Long userId, TypingIndicatorPayload payload) {
        Conversation conversation = getConversationById(payload.getConversationId());
        validateUserInConversation(userId, conversation);

        User recipient = getRecipientUser(conversation, userId);

        // Send typing indicator via WebSocket
        messagingTemplate.convertAndSendToUser(
                recipient.getId().toString(),
                "/queue/typing",
                payload
        );
    }

    /**
     * Mark conversation as read
     */
    @Transactional
    public void markConversationAsRead(Long userId, Long conversationId) {
        Conversation conversation = getConversationById(conversationId);
        validateUserInConversation(userId, conversation);

        User user = getUserById(userId);
        if (user.getRole() == UserRole.WORKER) {
            conversation.setWorkerUnreadCount(0);
        } else {
            conversation.setConsumerUnreadCount(0);
        }

        conversationRepository.save(conversation);

        // Mark individual messages as read
        List<ChatMessage> unreadMessages = conversation.getMessages().stream()
                .filter(msg -> !msg.getIsRead() && !msg.getSender().getId().equals(userId))
                .collect(Collectors.toList());

        for (ChatMessage message : unreadMessages) {
            message.setIsRead(true);
            message.setReadAt(LocalDateTime.now());
        }

        chatMessageRepository.saveAll(unreadMessages);
        log.info("Conversation {} marked as read by user {}", conversationId, userId);
    }

    /**
     * Get unread message count
     */
    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(Long userId) {
        User user = getUserById(userId);
        Integer unreadConversations;

        if (user.getRole() == UserRole.WORKER) {
            unreadConversations = conversationRepository.countUnreadConversationsForWorker(userId);
        } else {
            unreadConversations = conversationRepository.countUnreadConversationsForConsumer(userId);
        }

        // Calculate total unread messages across all conversations
        List<Conversation> conversations = conversationRepository.findUserConversations(userId);
        Integer totalUnreadMessages = conversations.stream()
                .mapToInt(conv -> {
                    if (user.getRole() == UserRole.WORKER) {
                        return conv.getWorkerUnreadCount();
                    } else {
                        return conv.getConsumerUnreadCount();
                    }
                })
                .sum();

        return UnreadCountResponse.builder()
                .totalUnreadMessages(totalUnreadMessages)
                .totalUnreadConversations(unreadConversations)
                .build();
    }

    /**
     * Create or get conversation between worker and consumer
     */
    @Transactional
    public Conversation getOrCreateConversation(Long workerId, Long consumerId) {
        return conversationRepository.findByWorkerIdAndConsumerId(workerId, consumerId)
                .orElseGet(() -> {
                    User worker = getUserById(workerId);
                    User consumer = getUserById(consumerId);

                    Conversation conversation = Conversation.builder()
                            .worker(worker)
                            .consumer(consumer)
                            .isActive(true)
                            .build();

                    return conversationRepository.save(conversation);
                });
    }

    // Helper methods

    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Conversation getConversationById(Long conversationId) {
        return conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
    }

    private void validateUserInConversation(Long userId, Conversation conversation) {
        boolean isParticipant = conversation.getWorker().getId().equals(userId) ||
                conversation.getConsumer().getId().equals(userId);

        if (!isParticipant) {
            throw new UnauthorizedException("You are not a participant in this conversation");
        }
    }

    private ChatMessage createChatMessage(User sender, Conversation conversation, SendMessageRequest request) {
        ChatMessage.MessageType messageType = request.getMessageType() != null
                ? ChatMessage.MessageType.valueOf(request.getMessageType())
                : ChatMessage.MessageType.TEXT;

        return ChatMessage.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent())
                .messageType(messageType)
                .attachmentUrl(request.getAttachmentUrl())
                .isRead(false)
                .build();
    }

    private void updateConversationAfterMessage(Conversation conversation, ChatMessage message, Long senderId) {
        conversation.setLastMessage(message.getContent());
        conversation.setLastMessageAt(message.getCreatedAt());

        // Increment unread count for recipient
        if (conversation.getWorker().getId().equals(senderId)) {
            conversation.setConsumerUnreadCount(conversation.getConsumerUnreadCount() + 1);
        } else {
            conversation.setWorkerUnreadCount(conversation.getWorkerUnreadCount() + 1);
        }

        conversationRepository.save(conversation);
    }

    private User getRecipientUser(Conversation conversation, Long senderId) {
        return conversation.getWorker().getId().equals(senderId)
                ? conversation.getConsumer()
                : conversation.getWorker();
    }

    private void sendMessageViaWebSocket(Conversation conversation, ChatMessageDTO messageDTO) {
        // Send to both participants
        messagingTemplate.convertAndSendToUser(
                conversation.getWorker().getId().toString(),
                "/queue/messages",
                messageDTO
        );
        messagingTemplate.convertAndSendToUser(
                conversation.getConsumer().getId().toString(),
                "/queue/messages",
                messageDTO
        );
    }

    private void notifyRecipient(User recipient, User sender, ChatMessage message) {
        notificationService.createNotification(
                recipient,
                "New message from " + sender.getUsername(),
                message.getContent().substring(0, Math.min(message.getContent().length(), 100)),
                Notification.NotificationType.NEW_MESSAGE,
                message.getConversation().getId(),
                "/chat/" + message.getConversation().getId()
        );
    }

    private ConversationDTO mapConversationToDTO(Conversation conversation, User currentUser) {
        User otherUser = conversation.getWorker().getId().equals(currentUser.getId())
                ? conversation.getConsumer()
                : conversation.getWorker();

        Integer unreadCount = conversation.getWorker().getId().equals(currentUser.getId())
                ? conversation.getWorkerUnreadCount()
                : conversation.getConsumerUnreadCount();

        return ConversationDTO.builder()
                .id(conversation.getId())
                .otherUserId(otherUser.getId())
                .otherUserName(otherUser.getUsername())
                .otherUserProfilePicture(null) // TODO: Get from profile
                .lastMessage(conversation.getLastMessage())
                .lastMessageAt(conversation.getLastMessageAt())
                .unreadCount(unreadCount)
                .isActive(conversation.getIsActive())
                .createdAt(conversation.getCreatedAt())
                .build();
    }

    private ChatMessageDTO mapChatMessageToDTO(ChatMessage message) {
        return ChatMessageDTO.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getUsername())
                .content(message.getContent())
                .messageType(message.getMessageType().name())
                .attachmentUrl(message.getAttachmentUrl())
                .isRead(message.getIsRead())
                .readAt(message.getReadAt())
                .createdAt(message.getCreatedAt())
                .build();
    }
}