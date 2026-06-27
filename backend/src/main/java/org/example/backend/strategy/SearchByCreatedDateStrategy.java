package org.example.backend.strategy;

import org.example.backend.dto.MovieSearchRequest;
import org.example.backend.entity.Movie;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class SearchByCreatedDateStrategy implements MovieSearchStrategy {

    @Override
    public boolean isApplicable(MovieSearchRequest request) {
        return request.getCreatedFrom() != null || request.getCreatedTo() != null;
    }

    @Override
    public Specification<Movie> getSpecification(MovieSearchRequest request) {
        return (root, query, cb) -> {
            if (request.getCreatedFrom() != null && request.getCreatedTo() != null) {
                return cb.between(root.get("createdAt"), request.getCreatedFrom(), request.getCreatedTo());
            } else if (request.getCreatedFrom() != null) {
                return cb.greaterThanOrEqualTo(root.get("createdAt"), request.getCreatedFrom());
            } else {
                return cb.lessThanOrEqualTo(root.get("createdAt"), request.getCreatedTo());
            }
        };
    }
}
