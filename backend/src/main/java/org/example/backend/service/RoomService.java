package org.example.backend.service;

import org.example.backend.dto.request.RoomRequest;
import org.example.backend.dto.response.RoomResponse;
import org.example.backend.dto.response.SeatResponse;
import org.example.backend.entity.Cinema;
import org.example.backend.entity.Room;
import org.example.backend.entity.Seat;
import org.example.backend.enums.RoomStatus;
import org.example.backend.enums.RoomType;
import org.example.backend.factory.RoomFactory;
import org.example.backend.repository.CinemaRepository;
import org.example.backend.repository.RoomRepository;
import org.example.backend.repository.SeatRepository;
import org.example.backend.repository.ShowtimeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class RoomService {
    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;
    private final CinemaRepository cinemaRepository;
    private final ShowtimeRepository showtimeRepository;
    private final RoomFactory roomFactory;

    public RoomService(
            RoomRepository roomRepository,
            SeatRepository seatRepository,
            CinemaRepository cinemaRepository,
            ShowtimeRepository showtimeRepository,
            RoomFactory roomFactory
    ) {
        this.roomRepository = roomRepository;
        this.seatRepository = seatRepository;
        this.cinemaRepository = cinemaRepository;
        this.showtimeRepository = showtimeRepository;
        this.roomFactory = roomFactory;
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getRooms(Long cinemaId) {
        List<Room> rooms = cinemaId == null
                ? roomRepository.findAllWithCinemaAndSeats()
                : roomRepository.findByCinemaIdWithCinemaAndSeats(cinemaId);

        return rooms.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long id) {
        return toResponse(findRoom(id));
    }

    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        validateRequest(request);
        Cinema cinema = findCinema(request.getCinemaId());
        request.setRoomCode(resolveRoomCodeForCreate(cinema.getId(), request.getName(), request.getRoomCode()));

        Room room = roomFactory.createRoom(request, cinema);
        return toResponse(roomRepository.save(room));
    }

    @Transactional
    public RoomResponse updateRoom(Long id, RoomRequest request) {
        validateRequest(request);
        Room room = findRoom(id);
        Cinema cinema = findCinema(request.getCinemaId());
        RoomType requestedRoomType = request.getRoomType() != null ? request.getRoomType() : room.getRoomType();
        RoomStatus requestedStatus = request.getStatus() != null ? request.getStatus() : room.getStatus();
        boolean hasShowtimes = showtimeRepository.existsByRoom_Id(id);
        boolean cinemaChanged = !Objects.equals(room.getCinema().getId(), cinema.getId());
        boolean layoutChanged = room.getSeatCount() != request.getSeatCount()
                || room.getRoomType() != requestedRoomType;

        if (hasShowtimes && (cinemaChanged || layoutChanged)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Không thể đổi rạp, loại phòng hoặc số ghế sau khi phòng đã có lịch chiếu"
            );
        }

        String requestedRoomCode = isBlank(request.getRoomCode())
                ? room.getRoomCode()
                : request.getRoomCode().trim();
        ensureRoomCodeAvailable(cinema.getId(), requestedRoomCode, id);

        room.setName(request.getName().trim());
        room.setRoomCode(requestedRoomCode);
        room.setStatus(requestedStatus);

        if (!hasShowtimes) {
            room.setCinema(cinema);
            room.setSeatCount(request.getSeatCount());
            room.setRoomType(requestedRoomType);

            if (layoutChanged || cinemaChanged) {
                if (room.getSeats() != null && !room.getSeats().isEmpty()) {
                    seatRepository.deleteAll(room.getSeats());
                    room.getSeats().clear();
                }
                room.setSeats(roomFactory.createSeats(room, request.getSeatCount(), room.getRoomType()));
            }
        }

        return toResponse(roomRepository.save(room));
    }

    @Transactional
    public void deleteRoom(Long id) {
        Room room = findRoom(id);
        if (showtimeRepository.existsByRoom_Id(id)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Không thể xóa phòng đã có lịch chiếu"
            );
        }

        roomRepository.delete(room);
    }

    private void validateRequest(RoomRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu phòng chiếu là bắt buộc");
        }
        if (request.getCinemaId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn rạp chiếu");
        }
        if (isBlank(request.getName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên phòng là bắt buộc");
        }
        if (request.getSeatCount() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số ghế phải lớn hơn 0");
        }
    }

    private String resolveRoomCodeForCreate(Long cinemaId, String roomName, String requestedRoomCode) {
        String baseCode = isBlank(requestedRoomCode)
                ? buildRoomCode(roomName)
                : requestedRoomCode.trim().toUpperCase();
        String candidate = baseCode;
        int suffix = 2;

        while (roomRepository.existsByCinema_IdAndRoomCodeIgnoreCase(cinemaId, candidate)) {
            candidate = baseCode + "-" + suffix;
            suffix++;
        }

        return candidate;
    }

    private String buildRoomCode(String roomName) {
        Matcher matcher = Pattern.compile("\\d+").matcher(roomName);
        if (matcher.find()) {
            return "P" + matcher.group();
        }

        String normalized = roomName.trim()
                .toUpperCase()
                .replaceAll("[^A-Z0-9]+", "");

        if (normalized.isBlank()) {
            return "P001";
        }

        return "P" + normalized.substring(0, Math.min(6, normalized.length()));
    }

    private void ensureRoomCodeAvailable(Long cinemaId, String roomCode, Long currentRoomId) {
        boolean duplicated = currentRoomId == null
                ? roomRepository.existsByCinema_IdAndRoomCodeIgnoreCase(cinemaId, roomCode.trim())
                : roomRepository.existsByCinema_IdAndRoomCodeIgnoreCaseAndIdNot(cinemaId, roomCode.trim(), currentRoomId);

        if (duplicated) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Mã phòng đã tồn tại trong rạp này"
            );
        }
    }

    private Cinema findCinema(Long id) {
        return cinemaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy rạp chiếu"));
    }

    private Room findRoom(Long id) {
        return roomRepository.findByIdWithCinemaAndSeats(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phòng chiếu"));
    }

    private RoomType resolveRoomType(RoomType roomType) {
        return roomType != null ? roomType : RoomType.STANDARD_2D;
    }

    private RoomResponse toResponse(Room room) {
        boolean hasShowtimes = room.getId() != null && showtimeRepository.existsByRoom_Id(room.getId());

        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .roomCode(room.getRoomCode())
                .seatCount(room.getSeatCount())
                .roomType(room.getRoomType())
                .status(room.getStatus())
                .cinemaId(room.getCinema() != null ? room.getCinema().getId() : null)
                .cinemaName(room.getCinema() != null ? room.getCinema().getName() : "")
                .seats(toSeatResponses(room.getSeats()))
                .hasShowtimes(hasShowtimes)
                .build();
    }

    private List<SeatResponse> toSeatResponses(List<Seat> seats) {
        if (seats == null) {
            return List.of();
        }

        return seats.stream()
                .sorted(Comparator
                        .comparingInt((Seat seat) -> toRowIndex(seat.getRowLabel()))
                        .thenComparingInt(Seat::getColumnNumber))
                .map(seat -> SeatResponse.builder()
                        .id(seat.getId())
                        .rowLabel(seat.getRowLabel())
                        .columnNumber(seat.getColumnNumber())
                        .seatType(seat.getSeatType())
                        .status(seat.getStatus())
                        .build())
                .toList();
    }

    private int toRowIndex(String rowLabel) {
        if (rowLabel == null || rowLabel.isBlank()) {
            return 0;
        }

        int value = 0;
        for (char character : rowLabel.toUpperCase().toCharArray()) {
            value = value * 26 + character - 'A' + 1;
        }
        return value;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
