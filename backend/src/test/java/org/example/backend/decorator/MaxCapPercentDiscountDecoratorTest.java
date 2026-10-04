package org.example.backend.decorator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MaxCapPercentDiscountDecoratorTest {

    private VoucherComponent baseVoucher;

    @BeforeEach
    void setUp() {
        baseVoucher = new BaseVoucher();
    }

    @Test
    @DisplayName("Branch 1: Đơn hàng nhỏ hơn giá trị tối thiểu -> Không giảm giá")
    void calculatePrice_BelowMinimumOrderAmount_NoDiscount() {
        // Arrange: Giảm 20%, tối đa 50.000 VNĐ, đơn tối thiểu 100.000 VNĐ
        VoucherComponent voucher = new MaxCapPercentDiscountDecorator(baseVoucher, 20.0, 50000.0, 100000.0);
        
        // Act: Đơn hàng 80.000 VNĐ (< 100.000 VNĐ)
        double result = voucher.calculatePrice(80000.0, 1);

        // Assert: Giữ nguyên 80.000 VNĐ
        assertEquals(80000.0, result);
    }

    @Test
    @DisplayName("Branch 2: Số tiền giảm vượt quá mức trần tối đa -> Giảm mức trần tối đa (50.000 VNĐ)")
    void calculatePrice_DiscountExceedsMaxCap_CapApplied() {
        // Arrange: Giảm 20%, tối đa 50.000 VNĐ, đơn tối thiểu 100.000 VNĐ
        VoucherComponent voucher = new MaxCapPercentDiscountDecorator(baseVoucher, 20.0, 50000.0, 100000.0);

        // Act: Đơn hàng 400.000 VNĐ (20% của 400k là 80k > 50k max cap)
        double result = voucher.calculatePrice(400000.0, 2);

        // Assert: 400.000 - 50.000 = 350.000 VNĐ
        assertEquals(350000.0, result);
    }

    @Test
    @DisplayName("Branch 3: Số tiền giảm hợp lệ -> Giảm đúng theo phần trăm (20%)")
    void calculatePrice_DiscountWithinMaxCap_PercentApplied() {
        // Arrange: Giảm 20%, tối đa 50.000 VNĐ, đơn tối thiểu 100.000 VNĐ
        VoucherComponent voucher = new MaxCapPercentDiscountDecorator(baseVoucher, 20.0, 50000.0, 100000.0);

        // Act: Đơn hàng 200.000 VNĐ (20% của 200k là 40k <= 50k max cap)
        double result = voucher.calculatePrice(200000.0, 2);

        // Assert: 200.000 - 40.000 = 160.000 VNĐ
        assertEquals(160000.0, result);
    }

    @Test
    @DisplayName("Test getDescription: Mô tả hiển thị đúng format")
    void getDescription_CorrectFormat() {
        VoucherComponent voucher = new MaxCapPercentDiscountDecorator(baseVoucher, 20.0, 50000.0, 100000.0);
        assertEquals("Voucher gốc + Giảm 20% (Tối đa 50000 VNĐ)", voucher.getDescription());
    }
}
