package org.example.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoucherRequest {
    private String name;
    private String code;
    private String description;
    private String voucherType;       // "PERCENT_DISCOUNT", "BUY_N_GET_FREE", "MIN_TICKET_DISCOUNT"
    private Double discountPercent;   // Dùng cho PERCENT_DISCOUNT, MIN_TICKET_DISCOUNT
    private Integer buyQuantity;      // Dùng cho BUY_N_GET_FREE
    private Integer freeQuantity;     // Dùng cho BUY_N_GET_FREE
    private Integer minTickets;       // Dùng cho MIN_TICKET_DISCOUNT
    private Double minimumOrderAmount;
    private Integer usageLimit;
    private String startTime;         // ISO format: "2026-07-01T00:00:00"
    private String endTime;
}
