package org.example.backend.decorator;

/**
 * Concrete Decorator — Giảm giá khi mua tối thiểu N vé.
 * VD: minTickets=2, discountPercent=20 → Mua ≥ 2 vé thì giảm 20%.
 * Nếu không đủ điều kiện (mua ít hơn N vé) → giữ nguyên giá.
 */
public class MinTicketDiscountDecorator extends VoucherDecorator {

    private final int minTickets;
    private final double discountPercent;

    public MinTicketDiscountDecorator(VoucherComponent wrappedVoucher, int minTickets, double discountPercent) {
        super(wrappedVoucher);
        this.minTickets = minTickets;
        this.discountPercent = discountPercent;
    }

    @Override
    public String getDescription() {
        return wrappedVoucher.getDescription()
                + " + Giảm " + (int) discountPercent + "% khi mua từ " + minTickets + " vé";
    }

    @Override
    public double calculatePrice(double originalPrice, int ticketCount) {
        double price = wrappedVoucher.calculatePrice(originalPrice, ticketCount);
        // Chỉ áp dụng giảm giá nếu số vé >= minTickets
        if (ticketCount >= minTickets) {
            return price * (1 - discountPercent / 100.0);
        }
        return price; // Không đủ điều kiện → giữ nguyên giá
    }
}
