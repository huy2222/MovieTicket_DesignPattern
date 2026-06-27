package org.example.backend.strategy;

import org.example.backend.dto.MovieSearchRequest;
import org.example.backend.entity.Movie;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class SearchByCreatedByStrategy implements MovieSearchStrategy {

    @Override
    public boolean isApplicable(MovieSearchRequest request) {
        return request.getCreatedBy() != null && !request.getCreatedBy().trim().isEmpty();
    }

    @Override
    public Specification<Movie> getSpecification(MovieSearchRequest request) {
        String pattern = "%" + request.getCreatedBy().trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("createdBy")), pattern);
    }
}
