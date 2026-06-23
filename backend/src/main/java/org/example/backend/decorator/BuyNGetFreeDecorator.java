package org.example.backend.decorator;

/**
 * Concrete Decorator — Mua N vé tặng M vé (tính tiền N vé thay vì N+M vé).
 * VD: buyQuantity=1, freeQuantity=1 → Mua 1 tặng 1.
 */
public class BuyNGetFreeDecorator extends VoucherDecorator {

    private final int buyQuantity;
    private final int freeQuantity;

    public BuyNGetFreeDecorator(VoucherComponent wrappedVoucher, int buyQuantity, int freeQuantity) {
        super(wrappedVoucher);
        this.buyQuantity = buyQuantity;
        this.freeQuantity = freeQuantity;
    }

    @Override
    public String getDescription() {
        return wrappedVoucher.getDescription() + " + Mua " + buyQuantity + " tặng " + freeQuantity;
    }

    @Override
    public double calculatePrice(double originalPrice, int ticketCount) {
        double price = wrappedVoucher.calculatePrice(originalPrice, ticketCount);
        if (ticketCount <= 0) return price;

        double pricePerTicket = price / ticketCount;
        int groupSize = buyQuantity + freeQuantity;
        int fullGroups = ticketCount / groupSize;
        int remainder = ticketCount % groupSize;

        // Mỗi nhóm (buy + free) chỉ tính tiền buy vé
        int paidTickets = fullGroups * buyQuantity + Math.min(remainder, buyQuantity);
        return paidTickets * pricePerTicket;
    }
}
