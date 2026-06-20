package org.example.backend.decorator;

/**
 * Concrete Decorator — Giảm giá theo phần trăm trên tổng giá.
 * VD: discountPercent = 20 → giảm 20% tổng giá.
 */
public class PercentDiscountDecorator extends VoucherDecorator {

    private final double discountPercent;

    public PercentDiscountDecorator(VoucherComponent wrappedVoucher, double discountPercent) {
        super(wrappedVoucher);
        this.discountPercent = discountPercent;
    }

    @Override
    public String getDescription() {
        return wrappedVoucher.getDescription() + " + Giảm " + (int) discountPercent + "%";
    }

    @Override
    public double calculatePrice(double originalPrice, int ticketCount) {
        double price = wrappedVoucher.calculatePrice(originalPrice, ticketCount);
        return price * (1 - discountPercent / 100.0);
    }
}
