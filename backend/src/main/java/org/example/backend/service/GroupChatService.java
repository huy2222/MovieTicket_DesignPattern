package org.example.backend.service;

import org.example.backend.dto.request.ChatMessageRequest;
import org.example.backend.dto.response.ChatMessageResponse;
import org.example.backend.entity.Customer;
import org.example.backend.entity.GroupBookingSession;
import org.example.backend.entity.Message;
import org.example.backend.entity.Movie;
import org.example.backend.enums.GroupBookingStatus;
import org.example.backend.repository.CustomerRepository;
import org.example.backend.repository.GroupBookingSessionRepository;
import org.example.backend.repository.MessageRepository;
import org.example.backend.repository.MovieRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class GroupChatService {
    private final CustomerRepository customerRepository;
    private final GroupBookingSessionRepository groupRepository;
    private final MessageRepository messageRepository;
    private final MovieRepository movieRepository;
    private final CineMeetRealtimePublisher realtimePublisher;

    public GroupChatService(
            CustomerRepository customerRepository,
            GroupBookingSessionRepository groupRepository,
            MessageRepository messageRepository,
            MovieRepository movieRepository,
            CineMeetRealtimePublisher realtimePublisher
    ) {
        this.customerRepository = customerRepository;
        this.groupRepository = groupRepository;
        this.messageRepository = messageRepository;
        this.movieRepository = movieRepository;
        this.realtimePublisher = realtimePublisher;
    }

    @Transactional
    public List<ChatMessageResponse> getMessages(String email, Long groupId) {
        Customer customer = findCustomer(email);
        findAccessibleGroup(groupId, customer);
        List<Message> messages = messageRepository.findByGroupBookingSession_IdOrderBySentAtAsc(groupId);
        messages.stream()
                .filter(message -> !message.getSender().getId().equals(customer.getId()))
                .filter(message -> !message.isRead())
                .forEach(message -> message.setRead(true));
        messageRepository.saveAll(messages);
        return messages.stream().map(this::toResponse).toList();
    }

    @Transactional
    public ChatMessageResponse sendMessage(String email, Long groupId, ChatMessageRequest request) {
        Customer sender = findCustomer(email);
        GroupBookingSession group = findAccessibleGroup(groupId, sender);
        if (group.getStatus() == GroupBookingStatus.CANCELLED
                || group.getStatus() == GroupBookingStatus.EXPIRED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Nhóm không còn hoạt động");
        }

        String content = request == null || request.getContent() == null
                ? "" : request.getContent().trim();
        Movie sharedMovie = null;
        if (request != null && request.getSharedMovieId() != null) {
            sharedMovie = movieRepository.findById(request.getSharedMovieId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phim"));
        }
        if (content.isBlank() && sharedMovie == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tin nhắn không được để trống");
        }
        if (content.length() > 1000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tin nhắn tối đa 1000 ký tự");
        }

        Message message = new Message();
        message.setGroupBookingSession(group);
        message.setConversationId(group.getConversationId());
        message.setSender(sender);
        message.setContent(content);
        message.setSharedMovie(sharedMovie);
        message.setSentAt(LocalDateTime.now());
        message.setRead(false);
        ChatMessageResponse response = toResponse(messageRepository.save(message));
        realtimePublisher.publishGroup(groupId, "GROUP_MESSAGE_CREATED", response);
        return response;
    }

    private Customer findCustomer(String email) {
        return customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thành viên"));
    }

    private GroupBookingSession findAccessibleGroup(Long groupId, Customer customer) {
        return groupRepository.findAccessible(groupId, customer.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không thuộc nhóm này"));
    }

    private ChatMessageResponse toResponse(Message message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .matchId(message.getMatch() != null ? message.getMatch().getId() : null)
                .groupId(message.getGroupBookingSession() != null
                        ? message.getGroupBookingSession().getId() : null)
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getProfileCard() != null
                        ? message.getSender().getProfileCard().getDisplayName()
                        : message.getSender().getFullName())
                .content(message.getContent())
                .sentAt(message.getSentAt())
                .read(message.isRead())
                .sharedMovieId(message.getSharedMovie() != null ? message.getSharedMovie().getId() : null)
                .sharedMovieTitle(message.getSharedMovie() != null ? message.getSharedMovie().getTitle() : null)
                .build();
    }
}
