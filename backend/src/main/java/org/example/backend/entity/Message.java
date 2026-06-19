package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // messageId

    private String content;
    private Long conversationId;
    private LocalDateTime sentAt;
    private boolean isRead; // map từ markAsRead()

    @ManyToOne
    @JoinColumn(name = "match_id")
    private Match match; // Đóng vai trò là conversation

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private Customer sender;

    @ManyToOne
    @JoinColumn(name = "shared_movie_id")
    private Movie sharedMovie;
}
