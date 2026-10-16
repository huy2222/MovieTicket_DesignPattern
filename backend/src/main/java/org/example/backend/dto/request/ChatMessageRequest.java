package org.example.backend.dto.request;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private String content;
    private Long sharedMovieId;
}
