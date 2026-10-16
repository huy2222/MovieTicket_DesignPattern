package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.MovieDateStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "movie_dates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieDate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // movieDateId

    private LocalDateTime proposedAt;
    private LocalDateTime expiresAt;

    @Enumerated(EnumType.STRING)
    private MovieDateStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposer_id")
    private Customer proposer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "showtime_id")
    private Showtime showtime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id")
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_booking_session_id")
    private GroupBookingSession groupBookingSession;
}
