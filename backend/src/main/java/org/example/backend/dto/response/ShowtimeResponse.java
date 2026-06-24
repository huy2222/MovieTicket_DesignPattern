package org.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.ShowtimeStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeResponse {
    private Long id;
    private Long movieId;
    private String movieTitle;
    private Integer movieDuration;
    private String moviePosterUrl;
    private Long cinemaId;
    private String cinemaName;
    private Long roomId;
    private String roomName;
    private String roomCode;
    private Integer seatCount;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double basePrice;
    private ShowtimeStatus status;
    private boolean locked;
}
