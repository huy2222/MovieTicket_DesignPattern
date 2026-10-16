package org.example.backend.decorator;

/**
 * Component interface cho Decorator Pattern.
 * Mọi loại voucher (base + decorator) đều implement interface này.
 */
public interface VoucherComponent {

    /**
     * Mô tả voucher (dùng để hiển thị cho admin/user)
     */
    String getDescription();

    /**
     * Tính giá sau khi áp dụng voucher.
     *
     * @param originalPrice tổng giá gốc của booking
     * @param ticketCount   số lượng vé trong booking
     * @return giá sau khi áp dụng voucher
     */
    double calculatePrice(double originalPrice, int ticketCount);
}
