package org.example.backend.strategy;

import org.example.backend.dto.MovieSearchRequest;
import org.example.backend.entity.Movie;
import org.example.backend.enums.MovieStatus;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SearchByStatusStrategy implements MovieSearchStrategy {

    @Override
    public boolean isApplicable(MovieSearchRequest request) {
        // Always run this strategy to apply active filters for users if status is omitted
        return true;
    }

    @Override
    public Specification<Movie> getSpecification(MovieSearchRequest request) {
        if (request.getStatus() != null) {
            return (root, query, cb) -> cb.equal(root.get("status"), request.getStatus());
        }

        // For public/user context, if status is null, show only NOW_SHOWING and COMING_SOON movies
        if (!request.isAdminContext()) {
            return (root, query, cb) -> root.get("status").in(List.of(MovieStatus.NOW_SHOWING, MovieStatus.COMING_SOON));
        }

        // Admin context with no status filter sees all movies
        return (root, query, cb) -> cb.conjunction();
    }
}
