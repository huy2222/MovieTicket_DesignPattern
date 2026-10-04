package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CineMeetReportEvidenceMessageResponse {
    private Long id;
    private Long senderId;
    private String senderName;
    private String content;
    private LocalDateTime sentAt;
    private boolean reportedMessage;
}
