package org.example.backend.repository;

import org.example.backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    @Query("""
            select distinct r from Room r
            left join fetch r.cinema
            left join fetch r.seats
            order by r.cinema.name asc, r.name asc
            """)
    List<Room> findAllWithCinemaAndSeats();

    @Query("""
            select distinct r from Room r
            left join fetch r.cinema
            left join fetch r.seats
            where r.cinema.id = :cinemaId
            order by r.name asc
            """)
    List<Room> findByCinemaIdWithCinemaAndSeats(@Param("cinemaId") Long cinemaId);

    @Query("""
            select distinct r from Room r
            left join fetch r.cinema
            left join fetch r.seats
            where r.id = :id
            """)
    Optional<Room> findByIdWithCinemaAndSeats(@Param("id") Long id);

    Optional<Room> findByCinema_IdAndRoomCodeIgnoreCase(Long cinemaId, String roomCode);

    boolean existsByCinema_IdAndRoomCodeIgnoreCase(Long cinemaId, String roomCode);

    boolean existsByCinema_IdAndRoomCodeIgnoreCaseAndIdNot(Long cinemaId, String roomCode, Long id);
}
