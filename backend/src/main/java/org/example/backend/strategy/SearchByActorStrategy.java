package org.example.backend.strategy;

import org.example.backend.dto.MovieSearchRequest;
import org.example.backend.entity.Movie;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class SearchByActorStrategy implements MovieSearchStrategy {

    @Override
    public boolean isApplicable(MovieSearchRequest request) {
        return request.getActor() != null && !request.getActor().trim().isEmpty();
    }

    @Override
    public Specification<Movie> getSpecification(MovieSearchRequest request) {
        String pattern = "%" + request.getActor().trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("cast")), pattern);
    }
}
