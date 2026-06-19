package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.LogAction;
import org.example.backend.enums.LogLevel;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // systemLogId

    private String description;
    private LocalDateTime createdAt;
    private boolean isSecurityEvent;

    @Enumerated(EnumType.STRING)
    private LogAction action;

    @Enumerated(EnumType.STRING)
    private LogLevel level;

    @ManyToOne
    @JoinColumn(name = "actor_id")
    private User actor;
}
