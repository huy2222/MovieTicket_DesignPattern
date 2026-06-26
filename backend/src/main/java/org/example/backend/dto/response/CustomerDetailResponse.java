package org.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.AccountStatus;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDetailResponse {
    private Long id;
    private String email;
    private String fullName;
    private Integer age;
    private String bio;
    private Integer loyaltyPoints;
    private AccountStatus status;
    private LocalDateTime createdAt;
    private String avatar;
}
