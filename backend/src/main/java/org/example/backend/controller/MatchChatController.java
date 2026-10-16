package org.example.backend.controller;

import org.example.backend.dto.request.ChatMessageRequest;
import org.example.backend.dto.response.ChatMessageResponse;
import org.example.backend.service.MatchChatService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/cinemeet/matches/{matchId}/messages")
public class MatchChatController {
    private final MatchChatService matchChatService;

    public MatchChatController(MatchChatService matchChatService) {
        this.matchChatService = matchChatService;
    }

    @GetMapping
    public List<ChatMessageResponse> getMessages(
            Principal principal,
            @PathVariable Long matchId,
            @RequestParam(required = false) Long beforeId,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return matchChatService.getMessages(principal.getName(), matchId, beforeId, limit);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ChatMessageResponse sendMessage(
            Principal principal,
            @PathVariable Long matchId,
            @RequestBody ChatMessageRequest request
    ) {
        return matchChatService.sendMessage(principal.getName(), matchId, request);
    }
}
