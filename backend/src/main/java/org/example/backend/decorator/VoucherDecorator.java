package org.example.backend.decorator;

/**
 * Abstract Decorator — Lớp trừu tượng bọc (wrap) một VoucherComponent.
 * Các concrete decorator sẽ kế thừa lớp này và override logic tính giá.
 */
public abstract class VoucherDecorator implements VoucherComponent {

    protected VoucherComponent wrappedVoucher;

    public VoucherDecorator(VoucherComponent wrappedVoucher) {
        this.wrappedVoucher = wrappedVoucher;
    }

    @Override
    public String getDescription() {
        return wrappedVoucher.getDescription();
    }

    @Override
    public double calculatePrice(double originalPrice, int ticketCount) {
        return wrappedVoucher.calculatePrice(originalPrice, ticketCount);
    }
}
