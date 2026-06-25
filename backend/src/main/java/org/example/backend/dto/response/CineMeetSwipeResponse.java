package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CineMeetSwipeResponse {
    private String swipeStatus;
    private boolean matched;
    private Long matchId;
    private Long conversationId;
    private String message;
}
