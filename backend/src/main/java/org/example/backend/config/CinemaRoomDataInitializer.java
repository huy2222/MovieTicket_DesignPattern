package org.example.backend.config;

import org.example.backend.dto.request.RoomRequest;
import org.example.backend.entity.Cinema;
import org.example.backend.entity.Room;
import org.example.backend.enums.CinemaStatus;
import org.example.backend.enums.RoomStatus;
import org.example.backend.enums.RoomType;
import org.example.backend.factory.RoomFactory;
import org.example.backend.repository.CinemaRepository;
import org.example.backend.repository.RoomRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Order(3)
public class CinemaRoomDataInitializer implements CommandLineRunner {

    private final CinemaRepository cinemaRepository;
    private final RoomRepository roomRepository;
    private final RoomFactory roomFactory;

    public CinemaRoomDataInitializer(
            CinemaRepository cinemaRepository,
            RoomRepository roomRepository,
            RoomFactory roomFactory
    ) {
        this.cinemaRepository = cinemaRepository;
        this.roomRepository = roomRepository;
        this.roomFactory = roomFactory;
    }

    @Override
    @Transactional
    public void run(String... args) {
        for (CinemaSeed cinemaSeed : cinemaSeeds()) {
            Cinema cinema = findCinema(cinemaSeed)
                    .map(existingCinema -> updateCinema(existingCinema, cinemaSeed))
                    .orElseGet(() -> cinemaRepository.save(createCinema(cinemaSeed)));

            seedRooms(cinema, cinemaSeed.rooms());
        }
    }

    private java.util.Optional<Cinema> findCinema(CinemaSeed seed) {
        java.util.Optional<Cinema> cinema = cinemaRepository.findByNameIgnoreCase(seed.name());
        if (cinema.isPresent() || seed.legacyName() == null) {
            return cinema;
        }

        return cinemaRepository.findByNameIgnoreCase(seed.legacyName());
    }

    private Cinema createCinema(CinemaSeed seed) {
        Cinema cinema = new Cinema();
        cinema.setName(seed.name());
        cinema.setPhoneNumber(seed.phoneNumber());
        cinema.setArea(seed.area());
        cinema.setAddress(seed.address());
        cinema.setStatus(seed.status());
        return cinema;
    }

    private Cinema updateCinema(Cinema cinema, CinemaSeed seed) {
        cinema.setName(seed.name());
        cinema.setPhoneNumber(seed.phoneNumber());
        cinema.setArea(seed.area());
        cinema.setAddress(seed.address());
        cinema.setStatus(seed.status());
        return cinemaRepository.save(cinema);
    }

    private void seedRooms(Cinema cinema, List<RoomSeed> roomSeeds) {
        for (RoomSeed seed : roomSeeds) {
            java.util.Optional<Room> existingRoom =
                    roomRepository.findByCinema_IdAndRoomCodeIgnoreCase(cinema.getId(), seed.roomCode());

            if (existingRoom.isPresent()) {
                updateRoom(existingRoom.get(), seed);
            } else {
                RoomRequest request = new RoomRequest();
                request.setCinemaId(cinema.getId());
                request.setName(seed.name());
                request.setRoomCode(seed.roomCode());
                request.setSeatCount(seed.seatCount());
                request.setRoomType(seed.roomType());
                request.setStatus(seed.status());

                Room room = roomFactory.createRoom(request, cinema);
                roomRepository.save(room);
            }
        }
    }

    private void updateRoom(Room room, RoomSeed seed) {
        room.setName(seed.name());
        room.setRoomCode(seed.roomCode());
        room.setSeatCount(seed.seatCount());
        room.setRoomType(seed.roomType());
        room.setStatus(seed.status());
        roomRepository.save(room);
    }

    private List<CinemaSeed> cinemaSeeds() {
        return List.of(
                new CinemaSeed(
                        "Galaxy Nguyễn Du",
                        "Galaxy Nguyen Du",
                        "02838234567",
                        "TP. Hồ Chí Minh",
                        "116 Nguyễn Du, P. Bến Thành, Q.1",
                        CinemaStatus.ACTIVE,
                        List.of(
                                new RoomSeed("Phòng 1", "P1", 80, RoomType.STANDARD_2D, RoomStatus.ACTIVE),
                                new RoomSeed("Phòng 2", "P2", 100, RoomType.PREMIUM_3D, RoomStatus.ACTIVE),
                                new RoomSeed("IMAX 1", "IMAX1", 120, RoomType.IMAX, RoomStatus.ACTIVE)
                        )
                ),
                new CinemaSeed(
                        "CGV Vincom Đồng Khởi",
                        "CGV Vincom Dong Khoi",
                        "02839363636",
                        "TP. Hồ Chí Minh",
                        "72 Lê Thánh Tôn, P. Bến Nghé, Q.1",
                        CinemaStatus.ACTIVE,
                        List.of(
                                new RoomSeed("Phòng 1", "P1", 90, RoomType.STANDARD_2D, RoomStatus.ACTIVE),
                                new RoomSeed("Phòng 2", "P2", 110, RoomType.PREMIUM_3D, RoomStatus.ACTIVE),
                                new RoomSeed("Couple 1", "C1", 48, RoomType.COUPLE_ROOM, RoomStatus.ACTIVE)
                        )
                ),
                new CinemaSeed(
                        "Lotte Cinema Gò Vấp",
                        "Lotte Cinema Go Vap",
                        "02839876543",
                        "TP. Hồ Chí Minh",
                        "242 Nguyễn Văn Lượng, Q. Gò Vấp",
                        CinemaStatus.ACTIVE,
                        List.of(
                                new RoomSeed("Phòng 1", "P1", 70, RoomType.STANDARD_2D, RoomStatus.ACTIVE),
                                new RoomSeed("Phòng 2", "P2", 90, RoomType.STANDARD_2D, RoomStatus.ACTIVE),
                                new RoomSeed("Phòng 3", "P3", 100, RoomType.PREMIUM_3D, RoomStatus.MAINTENANCE)
                        )
                ),
                new CinemaSeed(
                        "BHD Star Phạm Hùng",
                        "BHD Star Pham Hung",
                        "02437654321",
                        "Hà Nội",
                        "Tầng 4, Vincom Phạm Hùng, Nam Từ Liêm",
                        CinemaStatus.ACTIVE,
                        List.of(
                                new RoomSeed("Phòng 1", "P1", 96, RoomType.STANDARD_2D, RoomStatus.ACTIVE),
                                new RoomSeed("IMAX 1", "IMAX1", 132, RoomType.IMAX, RoomStatus.ACTIVE),
                                new RoomSeed("Couple 1", "C1", 40, RoomType.COUPLE_ROOM, RoomStatus.ACTIVE)
                        )
                ),
                new CinemaSeed(
                        "Cinestar Đà Lạt",
                        "Cinestar Da Lat",
                        "02633555555",
                        "Lâm Đồng",
                        "Quảng trường Lâm Viên, TP. Đà Lạt",
                        CinemaStatus.MAINTENANCE,
                        List.of(
                                new RoomSeed("Phòng 1", "P1", 60, RoomType.STANDARD_2D, RoomStatus.MAINTENANCE)
                        )
                )
        );
    }

    private record CinemaSeed(
            String name,
            String legacyName,
            String phoneNumber,
            String area,
            String address,
            CinemaStatus status,
            List<RoomSeed> rooms
    ) {
    }

    private record RoomSeed(
            String name,
            String roomCode,
            int seatCount,
            RoomType roomType,
            RoomStatus status
    ) {
    }
}
