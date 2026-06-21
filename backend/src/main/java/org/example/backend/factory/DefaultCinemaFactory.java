package org.example.backend.factory;

import org.example.backend.dto.request.CinemaRequest;
import org.example.backend.entity.Cinema;
import org.example.backend.enums.CinemaStatus;
import org.springframework.stereotype.Component;

@Component
public class DefaultCinemaFactory implements CinemaFactory {

    @Override
    public Cinema createCinema(CinemaRequest request) {
        Cinema cinema = new Cinema();
        cinema.setName(request.getName());
        cinema.setPhoneNumber(request.getPhoneNumber());
        cinema.setArea(request.getArea());
        cinema.setAddress(request.getAddress());
        cinema.setStatus(request.getStatus() != null ? request.getStatus() : CinemaStatus.ACTIVE);
        return cinema;
    }
}
