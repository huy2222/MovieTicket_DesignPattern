package org.example.backend.factory;

import org.example.backend.dto.request.RoomRequest;
import org.example.backend.entity.Cinema;
import org.example.backend.entity.Room;
import org.example.backend.entity.Seat;
import org.example.backend.enums.RoomType;

import java.util.List;

public interface RoomFactory {
    Room createRoom(RoomRequest request, Cinema cinema);

    List<Seat> createSeats(Room room, int seatCount, RoomType roomType);
}
