package org.example.backend.config;

import org.example.backend.dto.request.ShowtimeRequest;
import org.example.backend.entity.Cinema;
import org.example.backend.entity.Movie;
import org.example.backend.entity.Room;
import org.example.backend.entity.Showtime;
import org.example.backend.enums.CinemaStatus;
import org.example.backend.enums.MovieStatus;
import org.example.backend.enums.RoomStatus;
import org.example.backend.enums.RoomType;
import org.example.backend.enums.ShowtimeStatus;
import org.example.backend.factory.ShowtimeFactory;
import org.example.backend.repository.CinemaRepository;
import org.example.backend.repository.MovieRepository;
import org.example.backend.repository.ShowtimeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

//@Component
//@Order(4)
public class ShowtimeDataInitializer implements CommandLineRunner {
    private static final int SAMPLE_DAY_OFFSET = 1;

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final CinemaRepository cinemaRepository;
    private final ShowtimeFactory showtimeFactory;

    public ShowtimeDataInitializer(
            ShowtimeRepository showtimeRepository,
            MovieRepository movieRepository,
            CinemaRepository cinemaRepository,
            ShowtimeFactory showtimeFactory
    ) {
        this.showtimeRepository = showtimeRepository;
        this.movieRepository = movieRepository;
        this.cinemaRepository = cinemaRepository;
        this.showtimeFactory = showtimeFactory;
    }

    @Override
    @Transactional
    public void run(String... args) {
        List<Movie> movies = movieRepository.findAll().stream()
                .filter(movie -> movie.getStatus() == MovieStatus.NOW_SHOWING || movie.getStatus() == MovieStatus.COMING_SOON)
                .filter(movie -> movie.getDuration() > 0)
                // Đã xóa .limit(5) để lấy TOÀN BỘ phim
                .toList();

        if (movies.isEmpty()) {
            System.out.println("[Seed] Skipped showtimes because no active movies were found");
            return;
        }

        List<Cinema> cinemas = cinemaRepository.findAll().stream()
                .filter(cinema -> cinema.getStatus() == CinemaStatus.ACTIVE)
                .filter(cinema -> cinema.getRooms() != null && cinema.getRooms().stream().anyMatch(this::isActiveRoom))
                .sorted(Comparator.comparing(Cinema::getName))
                // Đã xóa .limit(2) để lấy TOÀN BỘ rạp
                .toList();

        int created = 0;
        int movieIndexCounter = 0; // Biến xoay vòng phim để rải đều
        List<Showtime> showtimesToSave = new java.util.ArrayList<>();

        // Rút gọn vòng lặp chỉ còn 3 ngày (Hôm nay, ngày mai, mốt) để DB không bị quá tải
        for (int dayOffset = 0; dayOffset <= 2; dayOffset++) {
            // Giới hạn 3 rạp đầu tiên để tránh bị treo DB trên Cloud
            List<Cinema> limitedCinemas = cinemas.stream().limit(3).toList();
            for (Cinema cinema : limitedCinemas) {
                List<Room> rooms = cinema.getRooms().stream()
                        .filter(this::isActiveRoom)
                        .sorted(Comparator.comparing(Room::getRoomCode))
                        .limit(2) // Giới hạn 2 phòng mỗi rạp
                        .toList();

                for (Room room : rooms) {
                    for (int slotIndex = 0; slotIndex < 4; slotIndex++) {
                        Movie movie = movies.get(movieIndexCounter % movies.size());
                        movieIndexCounter++;

                        LocalDateTime startTime = LocalDate.now()
                                .plusDays(dayOffset)
                                .atTime(slotFor(slotIndex));

                        LocalDateTime endTime = startTime.plusMinutes(movie.getDuration());
                        
                        if (showtimeRepository.existsOverlappingShowtime(
                                room.getId(),
                                startTime.minusMinutes(15),
                                endTime.plusMinutes(15),
                                null
                        )) {
                            continue;
                        }

                        ShowtimeRequest request = new ShowtimeRequest();
                        request.setMovieId(movie.getId());
                        request.setCinemaId(cinema.getId());
                        request.setRoomId(room.getId());
                        request.setStartTime(startTime);
                        request.setBasePrice(priceFor(room));
                        request.setStatus(ShowtimeStatus.AVAILABLE);

                        Showtime showtime = showtimeFactory.createShowtime(request, movie, cinema, room);
                        showtimesToSave.add(showtime);
                    }
                }
            }
        }

        if (!showtimesToSave.isEmpty()) {
            showtimeRepository.saveAll(showtimesToSave);
            System.out.println("[Seed] Created " + showtimesToSave.size() + " sample showtimes");
        }
    }

    private boolean isActiveRoom(Room room) {
        return room.getStatus() == RoomStatus.ACTIVE;
    }

    private LocalTime slotFor(int roomIndex) {
        List<LocalTime> slots = List.of(
                LocalTime.of(9, 30),
                LocalTime.of(13, 0),
                LocalTime.of(16, 30),
                LocalTime.of(20, 0)
        );
        return slots.get(roomIndex % slots.size());
    }

    private double priceFor(Room room) {
        RoomType type = room.getRoomType();
        if (type == RoomType.IMAX) {
            return 170000;
        }
        if (type == RoomType.PREMIUM_3D) {
            return 120000;
        }
        if (type == RoomType.COUPLE_ROOM) {
            return 150000;
        }
        return 85000;
    }
}
