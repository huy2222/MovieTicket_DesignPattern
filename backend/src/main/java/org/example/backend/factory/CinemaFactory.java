package org.example.backend.factory;

import org.example.backend.dto.request.CinemaRequest;
import org.example.backend.entity.Cinema;

public interface CinemaFactory {
    Cinema createCinema(CinemaRequest request);
}
