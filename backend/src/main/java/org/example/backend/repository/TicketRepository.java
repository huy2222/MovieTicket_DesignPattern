package org.example.backend.repository;

import org.example.backend.entity.Ticket;
import org.example.backend.repository.projection.DailyTicketProjection;
import org.example.backend.repository.projection.MovieTicketCountProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @Query("SELECT COUNT(t) FROM Ticket t")
    long countAllTickets();

    @Query("""
            SELECT COUNT(t)
            FROM Ticket t
            WHERE t.issuedAt >= :start
              AND t.issuedAt < :end
            """)
    long countByIssuedAtBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
            SELECT m.id AS movieId,
                   m.title AS movieTitle,
                   COUNT(t.id) AS ticketCount
            FROM Ticket t
            JOIN t.showtime s
            JOIN s.movie m
            WHERE t.issuedAt >= :start
              AND t.issuedAt < :end
            GROUP BY m.id, m.title
            ORDER BY COUNT(t.id) DESC
            """)
    List<MovieTicketCountProjection> topMoviesByTicketCount(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
            SELECT FUNCTION('DATE', t.issuedAt) AS saleDate,
                   COUNT(t.id) AS ticketCount
            FROM Ticket t
            WHERE t.issuedAt >= :start
              AND t.issuedAt < :end
            GROUP BY FUNCTION('DATE', t.issuedAt)
            ORDER BY FUNCTION('DATE', t.issuedAt)
            """)
    List<DailyTicketProjection> ticketsSoldByDay(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    boolean existsBySeat_IdAndShowtime_Id(Long seatId, Long showtimeId);

    @Query("SELECT t.seat.id FROM Ticket t WHERE t.showtime.id = :showtimeId AND t.status IN ('CONFIRMED', 'ISSUED', 'USED')")
    List<Long> findBookedSeatIdsByShowtimeId(@Param("showtimeId") Long showtimeId);

    List<Ticket> findByBookingId(Long bookingId);
    @Query("SELECT t.seat.id FROM Ticket t WHERE t.showtime.id = :showtimeId")
    List<Long> findBookedSeatIdsByShowtime(@Param("showtimeId") Long showtimeId);
}
