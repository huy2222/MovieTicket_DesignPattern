package org.example.backend.repository;

import org.example.backend.entity.Showtime;
import org.example.backend.enums.ShowtimeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    boolean existsByMovie_Id(Long movieId);

    boolean existsByRoom_Id(Long roomId);

    @Query("""
            select distinct s from Showtime s
            left join fetch s.movie
            left join fetch s.cinema
            left join fetch s.room
            where (:movieId is null or s.movie.id = :movieId)
              and (:cinemaId is null or s.cinema.id = :cinemaId)
              and (:roomId is null or s.room.id = :roomId)
              and (:status is null or s.status = :status)
              and (:fromTime is null or s.startTime >= :fromTime)
              and (:toTime is null or s.startTime < :toTime)
            order by s.startTime asc
            """)
    List<Showtime> findAllWithFilters(
            @Param("movieId") Long movieId,
            @Param("cinemaId") Long cinemaId,
            @Param("roomId") Long roomId,
            @Param("status") ShowtimeStatus status,
            @Param("fromTime") LocalDateTime fromTime,
            @Param("toTime") LocalDateTime toTime
    );

    @Query("""
            select distinct s from Showtime s
            left join fetch s.movie
            left join fetch s.cinema c
            left join fetch c.location l
            left join fetch s.room
            where s.id = :id
            """)
    Optional<Showtime> findWithDetailsById(@Param("id") Long id);

    @Query("""
            select distinct s from Showtime s
            left join fetch s.movie
            left join fetch s.cinema c
            left join fetch c.location l
            left join fetch s.room
            where s.movie.id = :movieId
              and l.city = :city
              and s.startTime >= :startOfDay
              and s.startTime < :endOfDay
              and s.status <> org.example.backend.enums.ShowtimeStatus.CANCELLED
            order by c.id asc, s.startTime asc
            """)
    List<Showtime> findShowtimesByMovieAndCityAndDate(
            @Param("movieId") Long movieId,
            @Param("city") String city,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    @Query("""
            select count(s) > 0 from Showtime s
            where s.room.id = :roomId
              and (:currentId is null or s.id <> :currentId)
              and s.status <> org.example.backend.enums.ShowtimeStatus.CANCELLED
              and s.startTime < :endTime
              and s.endTime > :startTime
            """)
    boolean existsOverlappingShowtime(
            @Param("roomId") Long roomId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("currentId") Long currentId
    );

    @Query("""
            select count(b) > 0 from Booking b
            where b.showtime.id = :showtimeId
            """)
    boolean existsBookingByShowtimeId(@Param("showtimeId") Long showtimeId);

    @Query("""
            select count(t) > 0 from Ticket t
            where t.showtime.id = :showtimeId
            """)
    boolean existsTicketByShowtimeId(@Param("showtimeId") Long showtimeId);

    @Query("""
            select count(h) > 0 from SeatHold h
            where h.showtime.id = :showtimeId
            """)
    boolean existsSeatHoldByShowtimeId(@Param("showtimeId") Long showtimeId);
}
