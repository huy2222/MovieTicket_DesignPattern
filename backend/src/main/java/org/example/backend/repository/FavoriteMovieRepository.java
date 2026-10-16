package org.example.backend.repository;

import org.example.backend.entity.FavoriteMovie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteMovieRepository extends JpaRepository<FavoriteMovie, Long> {

    List<FavoriteMovie> findByUser_EmailOrderByCreatedAtDesc(String email);

    boolean existsByUser_EmailAndMovie_Id(String email, Long movieId);

    Optional<FavoriteMovie> findByUser_EmailAndMovie_Id(String email, Long movieId);

    void deleteByUser_EmailAndMovie_Id(String email, Long movieId);
}
