package org.example.backend.factory;

import org.example.backend.dto.request.RoomRequest;
import org.example.backend.entity.Cinema;
import org.example.backend.entity.Room;
import org.example.backend.entity.Seat;
import org.example.backend.enums.RoomStatus;
import org.example.backend.enums.RoomType;
import org.example.backend.enums.SeatStatus;
import org.example.backend.enums.SeatType;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DefaultRoomFactory implements RoomFactory {
    @Override
    public Room createRoom(RoomRequest request, Cinema cinema) {
        RoomType roomType = resolveRoomType(request.getRoomType());
        Room room = new Room();
        room.setName(request.getName());
        room.setRoomCode(request.getRoomCode());
        room.setSeatCount(request.getSeatCount());
        room.setRoomType(roomType);
        room.setStatus(request.getStatus() != null ? request.getStatus() : RoomStatus.ACTIVE);
        room.setCinema(cinema);
        room.setSeats(createSeats(room, request.getSeatCount(), roomType));
        return room;
    }

    @Override
    public List<Seat> createSeats(Room room, int seatCount, RoomType roomType) {
        RoomType resolvedType = resolveRoomType(roomType);
        int columnsPerRow = getColumnsPerRow(resolvedType);
        int totalRows = (int) Math.ceil((double) seatCount / columnsPerRow);
        List<Seat> seats = new ArrayList<>();

        for (int index = 0; index < seatCount; index++) {
            int rowIndex = index / columnsPerRow;
            int columnNumber = index % columnsPerRow + 1;

            Seat seat = new Seat();
            seat.setRoom(room);
            seat.setRowLabel(toRowLabel(rowIndex));
            seat.setColumnNumber(columnNumber);
            seat.setSeatType(resolveSeatType(resolvedType, rowIndex, columnNumber, columnsPerRow, totalRows));
            seat.setStatus(SeatStatus.AVAILABLE);
            seats.add(seat);
        }

        return seats;
    }

    private RoomType resolveRoomType(RoomType roomType) {
        return roomType != null ? roomType : RoomType.STANDARD_2D;
    }

    private int getColumnsPerRow(RoomType roomType) {
        return switch (roomType) {
            case IMAX -> 12;
            case COUPLE_ROOM -> 8;
            default -> 10;
        };
    }

    private SeatType resolveSeatType(
            RoomType roomType,
            int rowIndex,
            int columnNumber,
            int columnsPerRow,
            int totalRows
    ) {
        if (roomType == RoomType.COUPLE_ROOM) {
            return SeatType.COUPLE;
        }

        if (roomType == RoomType.IMAX) {
            boolean middleRows = rowIndex >= Math.max(1, totalRows / 3)
                    && rowIndex <= Math.max(1, (totalRows * 2) / 3);
            boolean centerColumns = columnNumber > 2 && columnNumber <= columnsPerRow - 2;
            return middleRows && centerColumns ? SeatType.VIP : SeatType.STANDARD;
        }

        if (roomType == RoomType.PREMIUM_3D) {
            int firstVipRow = Math.max(1, totalRows / 2 - 1);
            int lastVipRow = Math.min(totalRows - 1, firstVipRow + 1);
            return rowIndex >= firstVipRow && rowIndex <= lastVipRow ? SeatType.VIP : SeatType.STANDARD;
        }

        return SeatType.STANDARD;
    }

    private String toRowLabel(int rowIndex) {
        StringBuilder label = new StringBuilder();
        int current = rowIndex;

        do {
            label.insert(0, (char) ('A' + current % 26));
            current = current / 26 - 1;
        } while (current >= 0);

        return label.toString();
    }
}
