package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import org.example.backend.enums.MatchStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CineMeetMatchResponse {
    private Long matchId;
    private Long conversationId;
    private MatchStatus status;
    private LocalDateTime matchedAt;
    private CineMeetPeerResponse peer;
    private List<String> favoriteGenres;
    private List<String> frequentCinemas;
}
