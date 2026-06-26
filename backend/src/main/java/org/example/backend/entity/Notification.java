package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.NotificationType;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // notificationId

    private String title;
    private String content;
    private LocalDateTime sentAt;
    private boolean isRead;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private NotificationType type;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // Gửi được cho cả Customer, Staff, Admin
}
