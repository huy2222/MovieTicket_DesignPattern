package org.example.backend.strategy;

import org.example.backend.dto.MovieSearchRequest;
import org.example.backend.entity.Movie;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class SearchByReleaseDateStrategy implements MovieSearchStrategy {

    @Override
    public boolean isApplicable(MovieSearchRequest request) {
        return request.getReleaseFrom() != null || request.getReleaseTo() != null;
    }

    @Override
    public Specification<Movie> getSpecification(MovieSearchRequest request) {
        if (request.getReleaseFrom() != null && request.getReleaseTo() != null
                && request.getReleaseFrom().isAfter(request.getReleaseTo())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ngày bắt đầu không được lớn hơn ngày kết thúc");
        }
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
