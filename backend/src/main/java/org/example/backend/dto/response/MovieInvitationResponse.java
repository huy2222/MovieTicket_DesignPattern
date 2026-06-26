package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import org.example.backend.enums.MovieDateStatus;

import java.time.LocalDateTime;

@Data
@Builder
public class MovieInvitationResponse {
    private Long id;
    private Long matchId;
    private Long proposerId;
    private String proposerName;
    private Long recipientId;
    private Long showtimeId;
    private Long movieId;
    private String movieTitle;
    private String moviePosterUrl;
    private String cinemaName;
    private String roomName;
    private LocalDateTime startTime;
    private LocalDateTime proposedAt;
    private LocalDateTime expiresAt;
    private MovieDateStatus status;
    private Long groupId;
}
