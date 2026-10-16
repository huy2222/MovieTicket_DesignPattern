package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import org.example.backend.enums.MatchStatus;

import java.time.LocalDateTime;

@Data
@Builder
public class MatchResponse {
    private Long id;
    private MatchStatus status;
    private LocalDateTime matchedAt;
    private Long otherCustomerId;
    private String otherDisplayName;
    private String otherAvatarUrl;
    private String lastMessage;
}
