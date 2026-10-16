package org.example.backend.dto.request;

import lombok.Data;
import org.example.backend.enums.SwipeDirection;

@Data
public class SwipeRequest {
    private Long targetCustomerId;
    private SwipeDirection direction;
}
