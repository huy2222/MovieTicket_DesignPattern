package org.example.backend.strategy;

import org.example.backend.dto.MovieSearchRequest;
import org.example.backend.entity.Movie;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class SearchByIdStrategy implements MovieSearchStrategy {

    @Override
    public boolean isApplicable(MovieSearchRequest request) {
        return request.getId() != null;
    }

    @Override
    public Specification<Movie> getSpecification(MovieSearchRequest request) {
        return (root, query, cb) -> cb.equal(root.get("id"), request.getId());
    }
}
