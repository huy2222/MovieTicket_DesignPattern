package org.example.backend.service;

import org.example.backend.dto.request.ChatMessageRequest;
import org.example.backend.dto.response.ChatMessageResponse;
import org.example.backend.entity.Customer;
import org.example.backend.entity.Match;
import org.example.backend.entity.Message;
import org.example.backend.enums.MatchStatus;
import org.example.backend.repository.CustomerRepository;
import org.example.backend.repository.MatchRepository;
import org.example.backend.repository.MessageRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class MatchChatService {
    private final CustomerRepository customerRepository;
    private final MatchRepository matchRepository;
    private final MessageRepository messageRepository;
    private final CineMeetRealtimePublisher realtimePublisher;

    public MatchChatService(
            CustomerRepository customerRepository,
            MatchRepository matchRepository,
            MessageRepository messageRepository,
            CineMeetRealtimePublisher realtimePublisher
    ) {
        this.customerRepository = customerRepository;
        this.matchRepository = matchRepository;
        this.messageRepository = messageRepository;
        this.realtimePublisher = realtimePublisher;
    }

    @Transactional
    public List<ChatMessageResponse> getMessages(String email, Long matchId, Long beforeId, int limit) {
        Customer customer = findCustomer(email);
        findAccessibleMatch(matchId, customer);
        
        messageRepository.markAllAsRead(matchId, customer.getId());

        List<Message> messages;
        if (beforeId == null) {
            messages = messageRepository.findLatestByMatchId(matchId, PageRequest.of(0, limit));
        } else {
            messages = messageRepository.findOlderByMatchId(matchId, beforeId, PageRequest.of(0, limit));
        }

        List<Message> result = new ArrayList<>(messages);
        Collections.reverse(result);

        return result.stream().map(this::toResponse).toList();
    }

    @Transactional
    public ChatMessageResponse sendMessage(String email, Long matchId, ChatMessageRequest request) {
        Customer sender = findCustomer(email);
        Match match = findAccessibleMatch(matchId, sender);
        if (match.getStatus() != MatchStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cuộc trò chuyện không còn hoạt động");
        }

        String content = request == null || request.getContent() == null
                ? "" : request.getContent().trim();
        if (content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tin nhắn không được để trống");
        }
        if (content.length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tin nhắn tối đa 1000 ký tự");
        }

        Message message = new Message();
        message.setMatch(match);
        message.setConversationId(match.getConversationId());
        message.setSender(sender);
        message.setContent(content);
        message.setSentAt(LocalDateTime.now());
        message.setRead(false);

        ChatMessageResponse response = toResponse(messageRepository.save(message));
        realtimePublisher.publishMatch(matchId, "MATCH_MESSAGE_CREATED", response);
        return response;
    }

    private Customer findCustomer(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thành viên"));
    }

    private Match findAccessibleMatch(Long matchId, Customer customer) {
        return matchRepository.findById(matchId)
                .filter(match -> match.getCustomerA().getId().equals(customer.getId())
                        || match.getCustomerB().getId().equals(customer.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không thuộc match này"));
    }

    private ChatMessageResponse toResponse(Message message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .matchId(message.getMatch().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getProfileCard() != null
                        ? message.getSender().getProfileCard().getDisplayName()
                        : message.getSender().getFullName())
                .content(message.getContent())
                .sentAt(message.getSentAt())
                .read(message.isRead())
                .build();
    }
}
