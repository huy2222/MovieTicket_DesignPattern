package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.MovieSearchRequest;
import org.example.backend.entity.Movie;
import org.example.backend.strategy.MovieSearchStrategy;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class SearchStrategyContext {

    private final List<MovieSearchStrategy> strategies;

    public Specification<Movie> buildSpecification(MovieSearchRequest request) {
        Specification<Movie> spec = (root, query, cb) -> cb.conjunction();

        for (MovieSearchStrategy strategy : strategies) {
            if (strategy.isApplicable(request)) {
                Specification<Movie> strategySpec = strategy.getSpecification(request);
                if (strategySpec != null) {
                    spec = spec.and(strategySpec);
                }
            }
        }
        return spec;
    }
}
