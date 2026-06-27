package org.example.backend.strategy;

import jakarta.persistence.criteria.Join;
import org.example.backend.dto.MovieSearchRequest;
import org.example.backend.entity.Genre;
import org.example.backend.entity.Movie;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class SearchByGenreStrategy implements MovieSearchStrategy {

    @Override
    public boolean isApplicable(MovieSearchRequest request) {
        return request.getGenreIds() != null && !request.getGenreIds().isEmpty();
    }

    @Override
    public Specification<Movie> getSpecification(MovieSearchRequest request) {
        return (root, query, cb) -> {
            query.distinct(true);
            Join<Movie, Genre> genreJoin = root.join("genres");
            return genreJoin.get("id").in(request.getGenreIds());
        };
    }
}
