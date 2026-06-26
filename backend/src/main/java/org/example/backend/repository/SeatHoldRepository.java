package org.example.backend.repository;

import org.example.backend.entity.SeatHold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SeatHoldRepository extends JpaRepository<SeatHold, Long> {
    Optional<SeatHold> findFirstBySeat_IdAndShowtime_IdAndExpiresAtAfter(
            Long seatId, Long showtimeId, LocalDateTime now);

    @Query("""
            select sh from SeatHold sh
            join fetch sh.customer
            where sh.seat.id = :seatId
              and sh.showtime.id = :showtimeId
              and sh.expiresAt > :now
            order by sh.expiresAt desc
            """)
    List<SeatHold> findActiveBySeatAndShowtimeWithCustomer(
            @Param("seatId") Long seatId,
            @Param("showtimeId") Long showtimeId,
            @Param("now") LocalDateTime now);

    @Query("SELECT sh.seat.id FROM SeatHold sh WHERE sh.showtime.id = :showtimeId AND sh.expiresAt > :now")
    List<Long> findActiveHeldSeatIdsByShowtime(@Param("showtimeId") Long showtimeId, @Param("now") LocalDateTime now);
}
