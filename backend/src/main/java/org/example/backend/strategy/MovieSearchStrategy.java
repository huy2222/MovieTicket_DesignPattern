package org.example.backend.strategy;

import org.example.backend.dto.MovieSearchRequest;
import org.example.backend.entity.Movie;
import org.springframework.data.jpa.domain.Specification;

public interface MovieSearchStrategy {
    boolean isApplicable(MovieSearchRequest request);
    Specification<Movie> getSpecification(MovieSearchRequest request);
}
