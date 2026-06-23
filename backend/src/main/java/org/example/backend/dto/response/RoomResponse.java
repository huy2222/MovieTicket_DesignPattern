package org.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.RoomStatus;
import org.example.backend.enums.RoomType;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private Long id;
    private String name;
    private String roomCode;
    private int seatCount;
    private RoomType roomType;
    private RoomStatus status;
    private Long cinemaId;
    private String cinemaName;
    private List<SeatResponse> seats;
    private boolean hasShowtimes;
}
