package org.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeSeatsResponse {
    private List<SeatResponse> allSeats;
    private List<SeatHoldResponse> seatHolds;
    private List<Long> bookedSeatIds;
}
