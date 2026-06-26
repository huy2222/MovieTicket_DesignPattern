package org.example.backend.repository;

import org.example.backend.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    boolean existsBySeat_IdAndShowtime_Id(Long seatId, Long showtimeId);

    @Query("SELECT t.seat.id FROM Ticket t WHERE t.showtime.id = :showtimeId AND t.status IN ('CONFIRMED', 'ISSUED', 'USED')")
    List<Long> findBookedSeatIdsByShowtimeId(@Param("showtimeId") Long showtimeId);

    List<Ticket> findByBookingId(Long bookingId);
    @Query("SELECT t.seat.id FROM Ticket t WHERE t.showtime.id = :showtimeId")
    List<Long> findBookedSeatIdsByShowtime(@Param("showtimeId") Long showtimeId);
}
