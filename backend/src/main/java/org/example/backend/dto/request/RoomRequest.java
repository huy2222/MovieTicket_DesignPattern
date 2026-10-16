package org.example.backend.dto.request;

import lombok.Data;
import org.example.backend.enums.RoomStatus;
import org.example.backend.enums.RoomType;

@Data
public class RoomRequest {
    private Long cinemaId;
    private String name;
    private String roomCode;
    private int seatCount;
    private RoomType roomType;
    private RoomStatus status;
}
