package org.example.backend.repository;

import org.example.backend.entity.MovieDate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieDateRepository extends JpaRepository<MovieDate, Long> {
    boolean existsByMovie_Id(Long movieId);
}
