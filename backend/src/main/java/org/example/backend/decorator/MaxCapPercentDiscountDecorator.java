package org.example.backend.decorator;

/**
 * Concrete Decorator — Giảm giá theo phần trăm có mức giảm tối đa (Max Cap)
 * và yêu cầu giá trị đơn hàng tối thiểu.
 */
public class MaxCapPercentDiscountDecorator extends VoucherDecorator {

    private final double discountPercent;
    private final double maxDiscountAmount;
    private final double minimumOrderAmount;

    public MaxCapPercentDiscountDecorator(VoucherComponent wrappedVoucher,
                                         double discountPercent,
                                         double maxDiscountAmount,
                                         double minimumOrderAmount) {
        super(wrappedVoucher);
        this.discountPercent = discountPercent;
        this.maxDiscountAmount = maxDiscountAmount;
        this.minimumOrderAmount = minimumOrderAmount;
    }

    @Override
    public String getDescription() {
        return wrappedVoucher.getDescription() 
                + " + Giảm " + (int) discountPercent + "% (Tối đa " + (long) maxDiscountAmount + " VNĐ)";
    }

    @Override
    public double calculatePrice(double originalPrice, int ticketCount) {
        double price = wrappedVoucher.calculatePrice(originalPrice, ticketCount);

        // Nhánh 1: Nếu giá trị đơn hàng nhỏ hơn mức tối thiểu -> Không giảm
        if (price < minimumOrderAmount) {
            return price;
        }

        double discount = price * (discountPercent / 100.0);

        // Nhánh 2: Nếu số tiền giảm vượt mức trần tối đa -> Giảm tối đa = maxDiscountAmount
        if (discount > maxDiscountAmount) {
            discount = maxDiscountAmount;
        }

        // Nhánh 3: Giảm giá theo phần trăm thực tế
        return price - discount;
    }
}
