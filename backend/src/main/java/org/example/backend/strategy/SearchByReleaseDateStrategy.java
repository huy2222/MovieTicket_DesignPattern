package org.example.backend.strategy;

import org.example.backend.dto.MovieSearchRequest;
import org.example.backend.entity.Movie;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class SearchByReleaseDateStrategy implements MovieSearchStrategy {

    @Override
    public boolean isApplicable(MovieSearchRequest request) {
        return request.getReleaseFrom() != null || request.getReleaseTo() != null;
    }

    @Override
    public Specification<Movie> getSpecification(MovieSearchRequest request) {
        return (root, query, cb) -> {
            if (request.getReleaseFrom() != null && request.getReleaseTo() != null) {
                return cb.between(root.get("releaseDate"), request.getReleaseFrom(), request.getReleaseTo());
            } else if (request.getReleaseFrom() != null) {
                return cb.greaterThanOrEqualTo(root.get("releaseDate"), request.getReleaseFrom());
            } else {
                return cb.lessThanOrEqualTo(root.get("releaseDate"), request.getReleaseTo());
            }
        };
    }
}
