package org.example.backend.repository;

import org.example.backend.entity.SeatHold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SeatHoldRepository extends JpaRepository<SeatHold, Long> {

    @Query("SELECT sh FROM SeatHold sh WHERE sh.showtime.id = :showtimeId")
    List<SeatHold> findByShowtimeId(@Param("showtimeId") Long showtimeId);
}
