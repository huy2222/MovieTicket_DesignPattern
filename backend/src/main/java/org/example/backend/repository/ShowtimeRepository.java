package org.example.backend.repository;

import org.example.backend.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    boolean existsByMovie_Id(Long movieId);
}
