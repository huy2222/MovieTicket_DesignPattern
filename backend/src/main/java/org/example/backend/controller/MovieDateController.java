package org.example.backend.controller;

import org.example.backend.dto.request.MovieDateRequest;
import org.example.backend.dto.response.MovieDateResponse;
import org.example.backend.service.MovieDateService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/cinemeet/matches/{matchId}/movie-dates")
public class MovieDateController {

    private final MovieDateService movieDateService;

    public MovieDateController(MovieDateService movieDateService) {
        this.movieDateService = movieDateService;
    }

    @GetMapping
    public List<MovieDateResponse> getMovieDates(Principal principal, @PathVariable Long matchId) {
        return movieDateService.getMovieDatesForMatch(principal.getName(), matchId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MovieDateResponse proposeMovieDate(
            Principal principal,
            @PathVariable Long matchId,
            @RequestBody MovieDateRequest request) {
        return movieDateService.proposeMovieDate(principal.getName(), matchId, request);
    }

    @PutMapping("/{dateId}/respond")
    public MovieDateResponse respondToMovieDate(
            Principal principal,
            @PathVariable Long matchId,
            @PathVariable Long dateId,
            @RequestParam boolean accept) {
        return movieDateService.respondToMovieDate(principal.getName(), dateId, accept);
    }
}
