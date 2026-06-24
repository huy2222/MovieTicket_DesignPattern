package org.example.backend.factory;

import org.example.backend.dto.request.ShowtimeRequest;
import org.example.backend.entity.Cinema;
import org.example.backend.entity.Movie;
import org.example.backend.entity.Room;
import org.example.backend.entity.Showtime;

public interface ShowtimeFactory {
    Showtime createShowtime(ShowtimeRequest request, Movie movie, Cinema cinema, Room room);

    void updateShowtime(Showtime showtime, ShowtimeRequest request, Movie movie, Cinema cinema, Room room);
}
