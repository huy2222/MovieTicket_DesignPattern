package org.example.backend.controller;

import org.example.backend.dto.response.VoucherResponse;
import org.example.backend.service.VoucherService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
public class PublicVoucherController {

    private final VoucherService voucherService;

    public PublicVoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @GetMapping("/applicable")
    public List<VoucherResponse> getApplicableVouchers(
            @RequestParam double originalPrice,
            @RequestParam int ticketCount) {
        return voucherService.getApplicableVouchers(originalPrice, ticketCount);
    }
}
