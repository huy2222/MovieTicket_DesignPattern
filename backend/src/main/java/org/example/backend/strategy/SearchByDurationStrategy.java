package org.example.backend.strategy;

import org.example.backend.dto.MovieSearchRequest;
import org.example.backend.entity.Movie;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class SearchByDurationStrategy implements MovieSearchStrategy {

    @Override
    public boolean isApplicable(MovieSearchRequest request) {
        return request.getMinDuration() != null || request.getMaxDuration() != null;
    }

    @Override
    public Specification<Movie> getSpecification(MovieSearchRequest request) {
        if (request.getMinDuration() != null && request.getMaxDuration() != null
                && request.getMinDuration() > request.getMaxDuration()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thời lượng tối thiểu không được lớn hơn thời lượng tối đa");
        }
        return (root, query, cb) -> {
            if (request.getMinDuration() != null && request.getMaxDuration() != null) {
                return cb.between(root.get("duration"), request.getMinDuration(), request.getMaxDuration());
            } else if (request.getMinDuration() != null) {
                return cb.greaterThanOrEqualTo(root.get("duration"), request.getMinDuration());
            } else {
                return cb.lessThanOrEqualTo(root.get("duration"), request.getMaxDuration());
            }
        };
    }
}
