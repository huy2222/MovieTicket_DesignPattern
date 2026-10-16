package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import org.example.backend.enums.CineMeetReportReason;
import org.example.backend.enums.CineMeetReportStatus;
import org.example.backend.enums.CineMeetReportTargetType;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CineMeetReportResponse {
    private Long id;
    private CineMeetReportTargetType targetType;
    private CineMeetReportReason reason;
    private String description;
    private CineMeetReportStatus status;
    private LocalDateTime createdAt;
    private Long reporterId;
    private String reporterName;
    private String reporterEmail;
    private Long reportedUserId;
    private String reportedUserName;
    private String reportedUserEmail;
    private String reportedUserAvatar;
    private Integer reportedUserAge;
    private String reportedUserBio;
    private Long messageId;
    private String messageContent;
    private LocalDateTime messageSentAt;
    private Long matchId;
    private Long reviewedById;
    private String reviewedByName;
    private LocalDateTime reviewStartedAt;
    private LocalDateTime resolvedAt;
    private String resolutionNote;
    private List<CineMeetReportEvidenceMessageResponse> evidenceMessages;
}
