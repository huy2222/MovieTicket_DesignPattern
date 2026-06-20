package org.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String voucherType;
    private Double discountPercent;
    private Integer buyQuantity;
    private Integer freeQuantity;
    private Integer minTickets;
    private Double minimumOrderAmount;
    private Integer usageLimit;
    private Integer usedCount;
    private String status;
    private String startTime;
    private String endTime;
    private String decoratorDescription;  // Mô tả từ Decorator (VD: "Giảm 20% khi mua từ 2 vé")
}
