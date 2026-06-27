package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatMessageResponse {
    private Long id;
    private Long matchId;
    private Long groupId;
    private Long senderId;
    private String senderName;
    private String content;
    private LocalDateTime sentAt;
    private boolean read;
    private Long sharedMovieId;
    private String sharedMovieTitle;
}
