package org.example.backend.controller;

import org.example.backend.dto.request.SwipeActionRequest;
import org.example.backend.dto.request.UpdateLocationRequest;
import org.example.backend.dto.response.CineMeetDiscoverItemResponse;
import org.example.backend.dto.response.CineMeetMatchResponse;
import org.example.backend.dto.response.CineMeetSwipeResponse;
import org.example.backend.dto.response.LocationResponse;
import org.example.backend.service.CineMeetService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/cinemeet")
public class CineMeetController {

    private final CineMeetService cineMeetService;

    public CineMeetController(CineMeetService cineMeetService) {
        this.cineMeetService = cineMeetService;
    }

    @GetMapping("/discover")
    public List<CineMeetDiscoverItemResponse> discover(Principal principal) {
        return cineMeetService.discover(principal.getName());
    }

    @PostMapping("/location")
    public LocationResponse updateLocation(Principal principal, @RequestBody UpdateLocationRequest request) {
        return cineMeetService.updateCurrentLocationWithFallback(principal.getName(), request);
    }

    @PostMapping("/swipe/left")
    @ResponseStatus(HttpStatus.CREATED)
    public CineMeetSwipeResponse swipeLeft(Principal principal, @RequestBody SwipeActionRequest request) {
        return cineMeetService.swipeLeft(principal.getName(), request.getTargetCustomerId());
    }

    @PostMapping("/swipe/right")
    @ResponseStatus(HttpStatus.CREATED)
    public CineMeetSwipeResponse swipeRight(Principal principal, @RequestBody SwipeActionRequest request) {
        return cineMeetService.swipeRight(principal.getName(), request.getTargetCustomerId());
    }

    @PostMapping("/matches/{id}/block")
    public CineMeetMatchResponse blockMatch(Principal principal, @PathVariable("id") Long id) {
        return cineMeetService.blockMatch(principal.getName(), id);
    }

    @PostMapping("/matches/{id}/close")
    public CineMeetMatchResponse closeMatch(Principal principal, @PathVariable("id") Long id) {
        return cineMeetService.closeMatch(principal.getName(), id);
    }

    @GetMapping("/matches")
    public List<CineMeetMatchResponse> getMatches(Principal principal) {
        return cineMeetService.getMatches(principal.getName());
    }

    @GetMapping("/matches/{id}")
    public CineMeetMatchResponse getMatchById(Principal principal, @PathVariable("id") Long id) {
        return cineMeetService.getMatchById(principal.getName(), id);
    }
}
