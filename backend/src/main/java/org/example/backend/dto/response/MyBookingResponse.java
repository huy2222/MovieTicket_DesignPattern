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
public class MyBookingResponse {
    private Long bookingId;
    private String movieTitle;           // Tên phim
    private String posterUrl;            // Poster phim
    private String showDate;             // Ngày chiếu: "24/06/2026"
    private String showtime;             // Giờ chiếu: "14:30 - 17:15"
    private String cinemaName;           // Tên rạp: "Galaxy Nguyễn Du"
    private String roomName;             // Phòng chiếu: "Phòng 3"
    private List<String> seatLabels;     // Ghế đã đặt: ["A1", "A2", "A3"]
    private String status;               // PENDING, CONFIRMED, CANCELLED, EXPIRED
    private double totalAmount;          // Tổng tiền
    private String bookingDate;          // Ngày đặt: "24/06/2026 08:30"
    private int ticketCount;             // Số lượng vé
}
