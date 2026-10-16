package org.example.backend.repository.projection;

import org.example.backend.enums.AccountStatus;
import org.example.backend.enums.Role;

import java.time.LocalDateTime;

public interface EmployeeProjection {
    Long getId();

    String getEmail();

    String getFullName();

    String getAvatarUrl();

    String getPhoneNumber();

    Role getRole();

    AccountStatus getStatus();

    LocalDateTime getCreatedAt();

    String getPosition();

    Long getCinemaId();

    String getCinemaName();
}
