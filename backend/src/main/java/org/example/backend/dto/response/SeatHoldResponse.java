package org.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatHoldResponse {
    private Long id;
    private Long seatId;
    private Long customerId;
    private LocalDateTime holdTime;
}
