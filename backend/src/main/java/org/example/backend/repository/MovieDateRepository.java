package org.example.backend.repository;

import org.example.backend.entity.MovieDate;
import org.example.backend.enums.MovieDateStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MovieDateRepository extends JpaRepository<MovieDate, Long> {
    boolean existsByMovie_Id(Long movieId);
    Optional<MovieDate> findByIdAndMatch_Id(Long id, Long matchId);
    Optional<MovieDate> findFirstByMatch_IdAndStatusOrderByProposedAtDesc(Long matchId, MovieDateStatus status);
    List<MovieDate> findByMatch_IdOrderByProposedAtDesc(Long matchId);
}
