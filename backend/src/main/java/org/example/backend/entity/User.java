package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.AccountStatus;
import org.example.backend.enums.Role;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // userId trong sơ đồ

    private String email;
    private String fullName;
    private String passwordHash;
    private String phoneNumber;
    private String avatarUrl;
    private LocalDateTime birthDate;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private AccountStatus status;

    private LocalDateTime createdAt;

    // Các list quan hệ (SystemLog, Notification) sẽ được map khi tạo các entity đó
    @OneToMany(mappedBy = "actor")
    private List<SystemLog> activityLogs;

    @OneToMany(mappedBy = "user")
    private List<Notification> notifications;
}
