package org.example.backend.decorator;

/**
 * Concrete Component — Voucher gốc, không có bất kỳ khuyến mãi nào.
 * Trả về giá gốc không thay đổi.
 */
public class BaseVoucher implements VoucherComponent {

    @Override
    public String getDescription() {
        return "Voucher gốc";
    }

    @Override
    public double calculatePrice(double originalPrice, int ticketCount) {
        return originalPrice; // Không giảm giá
    }
}
