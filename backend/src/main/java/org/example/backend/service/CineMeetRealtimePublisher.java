package org.example.backend.service;

import org.example.backend.dto.response.CineMeetRealtimeEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;

@Service
public class CineMeetRealtimePublisher {
    private final SimpMessagingTemplate messagingTemplate;

    public CineMeetRealtimePublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishMatch(Long matchId, String type, Object payload) {
        publishAfterCommit("/topic/cinemeet/matches/" + matchId, type, payload);
    }

    public void publishGroup(Long groupId, String type, Object payload) {
        publishAfterCommit("/topic/cinemeet/groups/" + groupId, type, payload);
    }

    private void publishAfterCommit(String destination, String type, Object payload) {
        Runnable send = () -> messagingTemplate.convertAndSend(
                destination,
                new CineMeetRealtimeEvent(type, payload, LocalDateTime.now())
        );
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    send.run();
                }
            });
        } else {
            send.run();
        }
    }
}
