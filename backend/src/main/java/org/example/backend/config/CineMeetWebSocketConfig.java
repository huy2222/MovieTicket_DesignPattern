package org.example.backend.config;

import lombok.RequiredArgsConstructor;
import org.example.backend.repository.GroupBookingSessionRepository;
import org.example.backend.repository.MatchRepository;
import org.example.backend.security.JwtService;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;

import java.util.List;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class CineMeetWebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private static final String MATCH_TOPIC = "/topic/cinemeet/matches/";
    private static final String GROUP_TOPIC = "/topic/cinemeet/groups/";

    private final JwtService jwtService;
    private final MatchRepository matchRepository;
    private final GroupBookingSessionRepository groupRepository;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-cinemeet")
                .setAllowedOrigins("http://localhost:5173");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor == null || accessor.getCommand() == null) return message;

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    authenticate(accessor);
                } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    authorizeSubscription(accessor);
                }
                return message;
            }
        });
    }

    private void authenticate(StompHeaderAccessor accessor) {
        String header = accessor.getFirstNativeHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Thiếu token WebSocket");
        }
        String token = header.substring(7);
        if (!jwtService.isValid(token)) {
            throw new IllegalArgumentException("Token WebSocket không hợp lệ");
        }
        String email = jwtService.extractEmail(token);
        String role = jwtService.extractRole(token);
        accessor.setUser(new UsernamePasswordAuthenticationToken(
                email,
                null,
                role == null ? List.of() : List.of(new SimpleGrantedAuthority("ROLE_" + role))
        ));
    }

    private void authorizeSubscription(StompHeaderAccessor accessor) {
        if (accessor.getUser() == null) {
            throw new IllegalArgumentException("Kết nối WebSocket chưa xác thực");
        }
        String destination = accessor.getDestination();
        String email = accessor.getUser().getName();
        if (destination == null) throw new IllegalArgumentException("Thiếu topic đăng ký");

        if (destination.startsWith(MATCH_TOPIC)) {
            Long matchId = parseId(destination, MATCH_TOPIC);
            if (!matchRepository.canAccess(matchId, email)) {
                throw new IllegalArgumentException("Không có quyền theo dõi match");
            }
            return;
        }
        if (destination.startsWith(GROUP_TOPIC)) {
            Long groupId = parseId(destination, GROUP_TOPIC);
            if (!groupRepository.canAccess(groupId, email)) {
                throw new IllegalArgumentException("Không có quyền theo dõi nhóm");
            }
            return;
        }
        throw new IllegalArgumentException("Topic không được phép");
    }

    private Long parseId(String destination, String prefix) {
        try {
            return Long.valueOf(destination.substring(prefix.length()));
        } catch (RuntimeException exception) {
            throw new IllegalArgumentException("Topic không hợp lệ");
        }
    }
}
