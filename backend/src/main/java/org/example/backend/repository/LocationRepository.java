package org.example.backend.repository;

import org.example.backend.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {

    @Query("""
            SELECT DISTINCT l.city
            FROM Showtime s
            JOIN s.cinema c
            JOIN c.location l
            WHERE s.movie.id = :movieId
              AND s.startTime >= :startOfDay
              AND s.startTime < :endOfDay
              AND s.status <> org.example.backend.enums.ShowtimeStatus.CANCELLED
            """)
    List<String> findCitiesWithShowtimesForMovieAndDate(
            @Param("movieId") Long movieId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );
}
