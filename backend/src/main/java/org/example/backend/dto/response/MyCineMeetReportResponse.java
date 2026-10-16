package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import org.example.backend.enums.CineMeetReportReason;
import org.example.backend.enums.CineMeetReportStatus;
import org.example.backend.enums.CineMeetReportTargetType;

import java.time.LocalDateTime;

@Data
@Builder
public class MyCineMeetReportResponse {
    private Long id;
    private CineMeetReportTargetType targetType;
    private CineMeetReportReason reason;
    private String description;
    private CineMeetReportStatus status;
    private LocalDateTime createdAt;
    private Long reportedUserId;
    private String reportedUserName;
    private String reportedUserAvatar;
    private Long messageId;
    private String messageContent;
    private LocalDateTime reviewStartedAt;
    private LocalDateTime resolvedAt;
    private String resolutionNote;
}
