package org.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.SeatStatus;
import org.example.backend.enums.SeatType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatResponse {
    private Long id;
    private String rowLabel;
    private int columnNumber;
    private SeatType seatType;
    private SeatStatus status;
}
