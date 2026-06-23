package org.example.backend.service;

import org.example.backend.dto.request.ShowtimeRequest;
import org.example.backend.dto.response.ShowtimeResponse;
import org.example.backend.entity.Cinema;
import org.example.backend.entity.Movie;
import org.example.backend.entity.Room;
import org.example.backend.entity.Showtime;
import org.example.backend.enums.CinemaStatus;
import org.example.backend.enums.MovieStatus;
import org.example.backend.enums.RoomStatus;
import org.example.backend.enums.ShowtimeStatus;
import org.example.backend.factory.ShowtimeFactory;
import org.example.backend.repository.CinemaRepository;
import org.example.backend.repository.MovieRepository;
import org.example.backend.repository.RoomRepository;
import org.example.backend.repository.ShowtimeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class ShowtimeService {
    private static final int ROOM_BUFFER_MINUTES = 15;

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final CinemaRepository cinemaRepository;
    private final RoomRepository roomRepository;
    private final ShowtimeFactory showtimeFactory;

    public ShowtimeService(
            ShowtimeRepository showtimeRepository,
            MovieRepository movieRepository,
            CinemaRepository cinemaRepository,
            RoomRepository roomRepository,
            ShowtimeFactory showtimeFactory
    ) {
        this.showtimeRepository = showtimeRepository;
        this.movieRepository = movieRepository;
        this.cinemaRepository = cinemaRepository;
        this.roomRepository = roomRepository;
        this.showtimeFactory = showtimeFactory;
    }

    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getShowtimes(
            Long movieId,
            Long cinemaId,
            Long roomId,
            LocalDate date,
            ShowtimeStatus status
    ) {
        LocalDateTime fromTime = date != null ? date.atStartOfDay() : null;
        LocalDateTime toTime = date != null ? date.plusDays(1).atStartOfDay() : null;

        return showtimeRepository.findAllWithFilters(movieId, cinemaId, roomId, status, fromTime, toTime)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ShowtimeResponse getShowtimeById(Long id) {
        return toResponse(findShowtime(id));
    }

    @Transactional
    public ShowtimeResponse createShowtime(ShowtimeRequest request) {
        validateRequest(request);
        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khong the tao lich chieu trong qua khu");
        }

        Movie movie = findMovie(request.getMovieId());
        Cinema cinema = findCinema(request.getCinemaId());
        Room room = findRoom(request.getRoomId());
        validateCreateReferences(movie, cinema, room);
        validateRoomBelongsToCinema(room, cinema);

        LocalDateTime endTime = calculateEndTime(request.getStartTime(), movie);
        ensureRoomAvailable(room.getId(), request.getStartTime(), endTime, null);

        Showtime showtime = showtimeFactory.createShowtime(request, movie, cinema, room);
        Showtime saved = showtimeRepository.save(showtime);
        return toResponse(findShowtime(saved.getId()));
    }

    @Transactional
    public ShowtimeResponse updateShowtime(Long id, ShowtimeRequest request) {
        validateRequest(request);

        Showtime showtime = findShowtime(id);
        Movie movie = findMovie(request.getMovieId());
        Cinema cinema = findCinema(request.getCinemaId());
        Room room = findRoom(request.getRoomId());
        validateRoomBelongsToCinema(room, cinema);

        boolean locked = hasRelatedData(id);
        boolean coreChanged = !Objects.equals(showtime.getMovie().getId(), movie.getId())
                || !Objects.equals(showtime.getCinema().getId(), cinema.getId())
                || !Objects.equals(showtime.getRoom().getId(), room.getId())
                || !Objects.equals(showtime.getStartTime(), request.getStartTime());

        if (locked && coreChanged) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Khong the doi phim, rap, phong hoac gio chieu khi lich da co du lieu dat ve"
            );
        }
        if (!locked && coreChanged && request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khong the doi lich chieu ve thoi gian trong qua khu");
        }
        if (!locked || coreChanged) {
            validateCreateReferences(movie, cinema, room);
        }

        LocalDateTime endTime = calculateEndTime(request.getStartTime(), movie);
        if (!locked || !Objects.equals(showtime.getStartTime(), request.getStartTime())) {
            ensureRoomAvailable(room.getId(), request.getStartTime(), endTime, id);
        }

        showtimeFactory.updateShowtime(showtime, request, movie, cinema, room);
        Showtime saved = showtimeRepository.save(showtime);
        return toResponse(findShowtime(saved.getId()));
    }

    @Transactional
    public void deleteShowtime(Long id) {
        Showtime showtime = findShowtime(id);
        if (hasRelatedData(id)) {
            showtime.setStatus(ShowtimeStatus.CANCELLED);
            showtimeRepository.save(showtime);
            return;
        }

        showtimeRepository.delete(showtime);
    }

    private void validateRequest(ShowtimeRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Du lieu lich chieu la bat buoc");
        }
        if (request.getMovieId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui long chon phim");
        }
        if (request.getCinemaId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui long chon rap chieu");
        }
        if (request.getRoomId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui long chon phong chieu");
        }
        if (request.getStartTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gio bat dau la bat buoc");
        }
        if (request.getBasePrice() == null || request.getBasePrice() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gia ve co ban phai lon hon 0");
        }
    }

    private void validateCreateReferences(Movie movie, Cinema cinema, Room room) {
        if (movie.getStatus() == MovieStatus.ENDED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khong the tao lich cho phim da ngung chieu");
        }
        if (movie.getDuration() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phim chua co thoi luong hop le");
        }
        if (cinema.getStatus() != CinemaStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rap chieu khong dang hoat dong");
        }
        if (room.getStatus() != RoomStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phong chieu khong dang hoat dong");
        }
    }

    private void validateRoomBelongsToCinema(Room room, Cinema cinema) {
        if (room.getCinema() == null || !Objects.equals(room.getCinema().getId(), cinema.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phong chieu khong thuoc rap da chon");
        }
    }

    private void ensureRoomAvailable(Long roomId, LocalDateTime startTime, LocalDateTime endTime, Long currentId) {
        LocalDateTime bufferedStart = startTime.minusMinutes(ROOM_BUFFER_MINUTES);
        LocalDateTime bufferedEnd = endTime.plusMinutes(ROOM_BUFFER_MINUTES);
        if (showtimeRepository.existsOverlappingShowtime(roomId, bufferedStart, bufferedEnd, currentId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Phong da co lich chieu trung hoac qua sat gio. Vui long chon khung gio khac"
            );
        }
    }

    private LocalDateTime calculateEndTime(LocalDateTime startTime, Movie movie) {
        return startTime.plusMinutes(movie.getDuration());
    }

    private Movie findMovie(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay phim"));
    }

    private Cinema findCinema(Long id) {
        return cinemaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay rap chieu"));
    }

    private Room findRoom(Long id) {
        return roomRepository.findByIdWithCinemaAndSeats(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay phong chieu"));
    }

    private Showtime findShowtime(Long id) {
        return showtimeRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay lich chieu"));
    }

    private boolean hasRelatedData(Long showtimeId) {
        return showtimeRepository.existsBookingByShowtimeId(showtimeId)
                || showtimeRepository.existsTicketByShowtimeId(showtimeId)
                || showtimeRepository.existsSeatHoldByShowtimeId(showtimeId);
    }

    private ShowtimeResponse toResponse(Showtime showtime) {
        Movie movie = showtime.getMovie();
        Cinema cinema = showtime.getCinema();
        Room room = showtime.getRoom();

        return ShowtimeResponse.builder()
                .id(showtime.getId())
                .movieId(movie != null ? movie.getId() : null)
                .movieTitle(movie != null ? movie.getTitle() : "")
                .movieDuration(movie != null ? movie.getDuration() : null)
                .moviePosterUrl(movie != null ? movie.getImages() : null)
                .cinemaId(cinema != null ? cinema.getId() : null)
                .cinemaName(cinema != null ? cinema.getName() : "")
                .roomId(room != null ? room.getId() : null)
                .roomName(room != null ? room.getName() : "")
                .roomCode(room != null ? room.getRoomCode() : "")
                .seatCount(room != null ? room.getSeatCount() : null)
                .startTime(showtime.getStartTime())
                .endTime(showtime.getEndTime())
                .basePrice(showtime.getBasePrice())
                .status(showtime.getStatus())
                .locked(showtime.getId() != null && hasRelatedData(showtime.getId()))
                .build();
    }
}
