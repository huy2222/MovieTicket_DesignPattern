package org.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffComboOrderResponse {
    private Long bookingId;
    private String bookingStatus;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String movieTitle;
    private String cinemaName;
    private String roomName;
    private LocalDateTime showtimeStart;
    private List<String> seatLabels;
    private List<BookingComboResponse> combos;
}
