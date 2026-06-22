package org.example.backend.repository;

import org.example.backend.entity.MovieHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieHistoryRepository extends JpaRepository<MovieHistory, Long> {
    boolean existsByMovie_Id(Long movieId);
}
