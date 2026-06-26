package org.example.backend.repository;

import org.example.backend.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    @Modifying
    @Query("delete from Seat s where s.room.id = :roomId")
    void deleteByRoomId(@Param("roomId") Long roomId);

    @Query("select s from Seat s join fetch s.room where s.id = :seatId")
    Optional<Seat> findByIdWithRoom(@Param("seatId") Long seatId);

    List<Seat> findByRoom_IdOrderByRowLabelAscColumnNumberAsc(Long roomId);
}
