package org.example.backend.factory;

import org.example.backend.dto.request.ShowtimeRequest;
import org.example.backend.entity.Cinema;
import org.example.backend.entity.Movie;
import org.example.backend.entity.Room;
import org.example.backend.entity.Showtime;
import org.example.backend.enums.ShowtimeStatus;
import org.springframework.stereotype.Component;

@Component
public class DefaultShowtimeFactory implements ShowtimeFactory {
    @Override
    public Showtime createShowtime(ShowtimeRequest request, Movie movie, Cinema cinema, Room room) {
        Showtime showtime = new Showtime();
        updateShowtime(showtime, request, movie, cinema, room);
        return showtime;
    }

    @Override
    public void updateShowtime(Showtime showtime, ShowtimeRequest request, Movie movie, Cinema cinema, Room room) {
        showtime.setMovie(movie);
        showtime.setCinema(cinema);
        showtime.setRoom(room);
        showtime.setStartTime(request.getStartTime());
        showtime.setEndTime(request.getStartTime().plusMinutes(movie.getDuration()));
        showtime.setBasePrice(request.getBasePrice());
        showtime.setStatus(request.getStatus() != null ? request.getStatus() : ShowtimeStatus.AVAILABLE);
    }
}
