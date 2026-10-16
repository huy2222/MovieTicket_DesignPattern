package org.example.backend.strategy;

import org.example.backend.dto.MovieSearchRequest;
import org.example.backend.entity.Movie;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class SearchByCountryStrategy implements MovieSearchStrategy {

    @Override
    public boolean isApplicable(MovieSearchRequest request) {
        return request.getCountry() != null && !request.getCountry().trim().isEmpty();
    }

    @Override
    public Specification<Movie> getSpecification(MovieSearchRequest request) {
        String pattern = "%" + request.getCountry().trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("country")), pattern);
    }
}
