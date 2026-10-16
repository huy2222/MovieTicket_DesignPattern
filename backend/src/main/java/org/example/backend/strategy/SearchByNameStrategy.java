package org.example.backend.strategy;

import org.example.backend.dto.MovieSearchRequest;
import org.example.backend.entity.Movie;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class SearchByNameStrategy implements MovieSearchStrategy {

    @Override
    public boolean isApplicable(MovieSearchRequest request) {
        return request.getKeyword() != null && !request.getKeyword().trim().isEmpty();
    }

    @Override
    public Specification<Movie> getSpecification(MovieSearchRequest request) {
        String pattern = "%" + request.getKeyword().trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), pattern),
                cb.like(cb.lower(root.get("englishTitle")), pattern)
        );
    }
}
