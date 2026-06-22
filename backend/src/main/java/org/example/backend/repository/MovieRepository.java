package org.example.backend.repository;

import org.example.backend.entity.Movie;
import org.example.backend.enums.MovieStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Optional;

public interface MovieRepository extends JpaRepository<Movie, Long> {

    @EntityGraph(attributePaths = {"genres"})
    Optional<Movie> findWithGenresById(Long id);

    @Query("""
            SELECT m FROM Movie m
            WHERE (:search IS NULL OR :search = '' OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(m.englishTitle) LIKE LOWER(CONCAT('%', :search, '%')))
            AND m.status IN :statuses
            """)
    Page<Movie> searchMovies(
            @Param("search") String search,
            @Param("statuses") Collection<MovieStatus> statuses,
            Pageable pageable
    );
}
