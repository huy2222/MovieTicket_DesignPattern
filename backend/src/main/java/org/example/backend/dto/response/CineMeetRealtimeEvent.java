package org.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class CineMeetRealtimeEvent {
    private String type;
    private Object payload;
    private LocalDateTime occurredAt;
}
