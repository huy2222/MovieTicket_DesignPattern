package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import org.example.backend.enums.GroupBookingStatus;
import org.example.backend.enums.GroupMemberStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class GroupBookingResponse {
    private Long id;
    private Long matchId;
    private Long invitationId;
    private GroupBookingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Long showtimeId;
    private Long movieId;
    private String movieTitle;
    private String moviePosterUrl;
    private String cinemaName;
    private String roomName;
    private LocalDateTime startTime;
    private List<MemberItem> members;

    @Data
    @Builder
    public static class MemberItem {
        private Long customerId;
        private String displayName;
        private String avatarUrl;
        private Long seatId;
        private String seatLabel;
        private GroupMemberStatus status;
        private Double amount;
    }

    @Data
    @Builder
    public static class SeatItem {
        private Long id;
        private String label;
        private String seatType;
        private boolean available;
    }
}
