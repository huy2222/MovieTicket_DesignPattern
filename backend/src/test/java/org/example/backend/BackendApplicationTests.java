package org.example.backend;

import org.example.backend.service.VoucherService;
import org.example.backend.repository.VoucherRepository;
import org.example.backend.entity.Voucher;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
class BackendApplicationTests {

    @Autowired
    private VoucherService voucherService;

    @Autowired
    private VoucherRepository voucherRepository;

    @Test
    void testDebugVoucher() {
        System.out.println("=================================");
        System.out.println("DEBUGGING VOUCHERS:");
        try {
            List<Voucher> vouchers = voucherRepository.findAll();
            if (vouchers.isEmpty()) {
                System.out.println("No vouchers found in database.");
            }
            for (Voucher v : vouchers) {
                System.out.println("Voucher ID: " + v.getId());
                System.out.println("Name: " + v.getName());
                System.out.println("Code: " + v.getCode());
                System.out.println("Status: " + v.getStatus());
                System.out.println("VoucherType: " + v.getVoucherType());
                
                try {
                    System.out.println("Trying to activate...");
                    voucherService.activateVoucher(v.getId());
                    System.out.println("Activation SUCCESS!");
                } catch (Exception e) {
                    System.out.println("Activation FAILED!");
                    e.printStackTrace();
                }
            }
        } catch (Exception e) {
            System.out.println("Failed to fetch vouchers from repository!");
            e.printStackTrace();
        }
        System.out.println("=================================");
    }
}
