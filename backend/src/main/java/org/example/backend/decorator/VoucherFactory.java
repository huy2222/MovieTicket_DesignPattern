package org.example.backend.decorator;

import org.example.backend.entity.Voucher;
import org.springframework.stereotype.Component;

/**
 * Factory để tạo VoucherComponent (Decorator chain) từ entity Voucher trong DB.
 * Dựa vào voucherType để lắp ráp đúng Decorator.
 */
@Component
public class VoucherFactory {

    /**
     * Tạo VoucherComponent từ entity Voucher.
     *
     * @param voucher entity từ database
     * @return VoucherComponent tương ứng (đã bọc Decorator)
     */
    public VoucherComponent createVoucherComponent(Voucher voucher) {
        VoucherComponent component = new BaseVoucher();

        if (voucher.getVoucherType() == null) {
            return component;
        }

        switch (voucher.getVoucherType()) {
            case PERCENT_DISCOUNT:
                component = new PercentDiscountDecorator(
                        component,
                        voucher.getDiscountPercent() != null ? voucher.getDiscountPercent() : 0
                );
                break;

            case BUY_N_GET_FREE:
                component = new BuyNGetFreeDecorator(
                        component,
                        voucher.getBuyQuantity() != null ? voucher.getBuyQuantity() : 1,
                        voucher.getFreeQuantity() != null ? voucher.getFreeQuantity() : 1
                );
                break;

            case MIN_TICKET_DISCOUNT:
                component = new MinTicketDiscountDecorator(
                        component,
                        voucher.getMinTickets() != null ? voucher.getMinTickets() : 1,
                        voucher.getDiscountPercent() != null ? voucher.getDiscountPercent() : 0
                );
                break;
        }

        return component;
    }
}
