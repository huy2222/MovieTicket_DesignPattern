package org.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.ComboFulfillmentStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingComboResponse {
    private Long id;
    private Long comboId;
    private String comboName;
    private String description;
    private String imageUrl;
    private int quantity;
    private double price;
    private ComboFulfillmentStatus fulfillmentStatus;
    private LocalDateTime receivedAt;
    private Long confirmedByStaffId;
    private String confirmedByStaffName;
}
