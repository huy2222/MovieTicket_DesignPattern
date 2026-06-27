package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import org.example.backend.enums.MovieDateStatus;

import java.time.LocalDateTime;

@Data
@Builder
public class MovieDateResponse {
    private Long id;
    private Long matchId;
    private Long proposerId;
    private Long movieId;
    private String movieTitle;
    private String moviePosterUrl;
    private Long showtimeId;
    private String cinemaName;
    private String roomName;
    private LocalDateTime startTime;
    private MovieDateStatus status;
    private LocalDateTime proposedAt;
    private LocalDateTime expiresAt;
    private Long groupBookingSessionId;
}
