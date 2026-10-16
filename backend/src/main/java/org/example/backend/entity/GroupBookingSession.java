package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.GroupBookingStatus;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "group_booking_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupBookingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // groupBookingSessionId

    private Long conversationId;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    private GroupBookingStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "showtime_id")
    private Showtime showtime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id")
    private Match match;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_date_id", unique = true)
    private MovieDate invitation;

    @ManyToMany
    @JoinTable(
            name = "group_booking_participants",
            joinColumns = @JoinColumn(name = "session_id"),
            inverseJoinColumns = @JoinColumn(name = "customer_id")
    )
    private List<Customer> participants;

    @OneToMany(mappedBy = "groupBookingSession", cascade = CascadeType.ALL)
    private List<ParticipantPayment> participantPayments;

    @OneToMany(mappedBy = "groupBookingSession", cascade = CascadeType.ALL)
    private List<SeatHold> seatHolds;

    @OneToMany(mappedBy = "groupBookingSession")
    private List<MovieDate> movieDates;
}
