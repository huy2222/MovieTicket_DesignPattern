package org.example.backend.dto.request;

import lombok.Data;
import org.example.backend.enums.ShowtimeStatus;

import java.time.LocalDateTime;

@Data
public class ShowtimeRequest {
    private Long movieId;
    private Long cinemaId;
    private Long roomId;
    private LocalDateTime startTime;
    private Double basePrice;
    private ShowtimeStatus status;
}
