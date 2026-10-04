package org.example.backend.config;

import org.example.backend.entity.*;
import org.example.backend.enums.*;
import org.example.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final LocationRepository locationRepository;
    private final CinemaRepository cinemaRepository;
    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;
    private final MovieRepository movieRepository;
    private final ShowtimeRepository showtimeRepository;

    public DataSeeder(LocationRepository locationRepository, CinemaRepository cinemaRepository, RoomRepository roomRepository, SeatRepository seatRepository, MovieRepository movieRepository, ShowtimeRepository showtimeRepository) {
        this.locationRepository = locationRepository;
        this.cinemaRepository = cinemaRepository;
        this.roomRepository = roomRepository;
        this.seatRepository = seatRepository;
        this.movieRepository = movieRepository;
        this.showtimeRepository = showtimeRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (movieRepository.count() == 0) {
            System.out.println("Seeding database with test data (Movie, Cinema, Room, Seats, Showtime)...");

            // 1. Location
            Location location = new Location();
            location.setCity("Hồ Chí Minh");
            location.setDistrict("Quận 1");
            location.setAddress("Vincom Đồng Khởi");
            location = locationRepository.save(location);

            // 2. Cinema
            Cinema cinema = new Cinema();
            cinema.setName("CGV Vincom Đồng Khởi");
            cinema.setPhoneNumber("1900 6017");
            cinema.setArea("Miền Nam");
            cinema.setAddress("Tầng 3, Vincom Đồng Khởi, Quận 1, TP.HCM");
            cinema.setStatus(CinemaStatus.ACTIVE);
            cinema.setLocation(location);
            cinema = cinemaRepository.save(cinema);

            // 3. Room
            Room room = new Room();
            room.setName("Phòng 1");
            room.setRoomCode("R1");
            room.setSeatCount(50);
            room.setRoomType(RoomType.STANDARD_2D);
            room.setStatus(RoomStatus.ACTIVE);
            room.setCinema(cinema);
            room = roomRepository.save(room);

            // 4. Seats
            List<Seat> seats = new ArrayList<>();
            String[] rows = {"A", "B", "C", "D", "E"};
            for (String row : rows) {
                for (int col = 1; col <= 10; col++) {
                    Seat seat = new Seat();
                    seat.setRowLabel(row);
                    seat.setColumnNumber(col);
                    seat.setSeatType(SeatType.STANDARD);
                    seat.setStatus(SeatStatus.AVAILABLE);
                    seat.setRoom(room);
                    seats.add(seat);
                }
            }
            seatRepository.saveAll(seats);

            // 5. Movie
            Movie movie = new Movie();
            movie.setTitle("Mai");
            movie.setEnglishTitle("Mai");
            movie.setDescription("Bộ phim tâm lý tình cảm của Trấn Thành.");
            movie.setDirector("Trấn Thành");
            movie.setCast("Phương Anh Đào, Tuấn Trần");
            movie.setCountry("Việt Nam");
            movie.setLanguage("Tiếng Việt");
            movie.setAgeRating("18+");
            movie.setDuration(131);
            movie.setImages("https://s3img.vcdn.vn/123phim/2024/02/mai-17071191028308.jpg");
            movie.setReleaseDate(LocalDate.now().minusDays(10));
            movie.setStatus(MovieStatus.NOW_SHOWING);
            movie = movieRepository.save(movie);

            // 6. Showtime (Hôm nay)
            Showtime showtimeToday = new Showtime();
            showtimeToday.setMovie(movie);
            showtimeToday.setCinema(cinema);
            showtimeToday.setRoom(room);
            // Lấy giờ hiện tại cộng thêm 2 tiếng để suất chiếu luôn hợp lệ trong ngày hôm nay
            showtimeToday.setStartTime(LocalDateTime.now().plusHours(2).withMinute(0).withSecond(0).withNano(0));
            showtimeToday.setEndTime(showtimeToday.getStartTime().plusMinutes(movie.getDuration()));
            showtimeToday.setBasePrice(100000.0);
            showtimeToday.setStatus(ShowtimeStatus.AVAILABLE);
            showtimeRepository.save(showtimeToday);

            // 7. Showtime (Ngày mai)
            Showtime showtimeTomorrow = new Showtime();
            showtimeTomorrow.setMovie(movie);
            showtimeTomorrow.setCinema(cinema);
            showtimeTomorrow.setRoom(room);
            showtimeTomorrow.setStartTime(LocalDateTime.now().plusDays(1).withHour(19).withMinute(0).withSecond(0).withNano(0));
            showtimeTomorrow.setEndTime(showtimeTomorrow.getStartTime().plusMinutes(movie.getDuration()));
            showtimeTomorrow.setBasePrice(120000.0);
            showtimeTomorrow.setStatus(ShowtimeStatus.AVAILABLE);
            showtimeRepository.save(showtimeTomorrow);

            System.out.println("Database seeded successfully! You can now book tickets.");
        }
    }
}
