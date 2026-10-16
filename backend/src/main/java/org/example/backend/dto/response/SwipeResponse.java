package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import org.example.backend.enums.SwipeDirection;

@Data
@Builder
public class SwipeResponse {
    private Long swipeId;
    private SwipeDirection direction;
    private boolean matched;
    private Long matchId;
}
