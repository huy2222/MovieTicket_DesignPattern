package org.example.backend.controller;

import org.example.backend.dto.request.MovieRequest;
import org.example.backend.dto.request.MovieStatusRequest;
import org.example.backend.dto.response.MovieDeleteResponse;
import org.example.backend.dto.response.MovieResponse;
import org.example.backend.enums.MovieStatus;
import org.example.backend.service.MovieService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping
    public ResponseEntity<?> getMovies(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) MovieStatus status,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortDirection
    ) {
        if (page == null) {
            return ResponseEntity.ok(movieService.getMoviesByStatus(status));
        }
        return ResponseEntity.ok(movieService.getMovies(
                search,
                status,
                page,
                size != null ? size : 10,
                sortDirection != null ? sortDirection : "desc"
        ));
    }

    @GetMapping("/{id}")
    public MovieResponse getMovieById(@PathVariable Long id) {
        return movieService.getMovieById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MovieResponse createMovie(@RequestBody MovieRequest request) {
        return movieService.createMovie(request);
    }

    @PutMapping("/{id}")
    public MovieResponse updateMovie(@PathVariable Long id, @RequestBody MovieRequest request) {
        return movieService.updateMovie(id, request);
    }

    @PatchMapping("/{id}/status")
    public MovieResponse updateMovieStatus(@PathVariable Long id, @RequestBody MovieStatusRequest request) {
        return movieService.updateMovieStatus(id, request);
    }

    @DeleteMapping("/{id}")
    public MovieDeleteResponse deleteMovie(@PathVariable Long id) {
        return movieService.deleteMovie(id);
    }
}
