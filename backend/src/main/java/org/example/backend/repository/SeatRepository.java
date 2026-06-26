package org.example.backend.repository;

import org.example.backend.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    @Modifying
    @Query("delete from Seat s where s.room.id = :roomId")
    void deleteByRoomId(@Param("roomId") Long roomId);

    List<Seat> findByRoomId(Long roomId);
}
