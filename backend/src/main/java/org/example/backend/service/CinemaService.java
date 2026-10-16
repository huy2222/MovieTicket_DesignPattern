package org.example.backend.service;

import org.example.backend.dto.request.CinemaRequest;
import org.example.backend.dto.response.CinemaResponse;
import org.example.backend.entity.Cinema;
import org.example.backend.factory.CinemaFactory;
import org.example.backend.repository.CinemaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CinemaService {

    private final CinemaRepository cinemaRepository;
    private final CinemaFactory cinemaFactory;

    public CinemaService(CinemaRepository cinemaRepository, CinemaFactory cinemaFactory) {
        this.cinemaRepository = cinemaRepository;
        this.cinemaFactory = cinemaFactory;
    }

    public List<CinemaResponse> getAllCinemas() {
        return cinemaRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CinemaResponse getCinemaById(Long id) {
        return toResponse(findCinema(id));
    }

    public CinemaResponse createCinema(CinemaRequest request) {
        Cinema cinema = cinemaFactory.createCinema(request);
        return toResponse(cinemaRepository.save(cinema));
    }

    public CinemaResponse updateCinema(Long id, CinemaRequest request) {
        Cinema cinema = findCinema(id);

        cinema.setName(request.getName());
        cinema.setPhoneNumber(request.getPhoneNumber());
        cinema.setArea(request.getArea());
        cinema.setAddress(request.getAddress());
        if (request.getStatus() != null) {
            cinema.setStatus(request.getStatus());
        }

        return toResponse(cinemaRepository.save(cinema));
    }

    public void deleteCinema(Long id) {
        Cinema cinema = findCinema(id);
        cinemaRepository.delete(cinema);
    }

    private Cinema findCinema(Long id) {
        return cinemaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cinema not found"));
    }

    private CinemaResponse toResponse(Cinema cinema) {
        return CinemaResponse.builder()
                .id(cinema.getId())
                .name(cinema.getName())
                .phoneNumber(cinema.getPhoneNumber())
                .area(cinema.getArea())
                .address(cinema.getAddress())
                .status(cinema.getStatus())
                .build();
    }
}
