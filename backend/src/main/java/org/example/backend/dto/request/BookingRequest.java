package org.example.backend.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class BookingRequest {
    private Long customerId;
    private Long showtimeId;
    private List<Long> seatIds;
    private String voucherCode;
}
