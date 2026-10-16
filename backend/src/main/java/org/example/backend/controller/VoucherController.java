package org.example.backend.controller;

import org.example.backend.dto.request.VoucherRequest;
import org.example.backend.dto.response.VoucherResponse;
import org.example.backend.service.VoucherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/vouchers")
public class VoucherController {

    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @GetMapping
    public List<VoucherResponse> getAllVouchers() {
        return voucherService.getAllVouchers();
    }

    @GetMapping("/{id}")
    public VoucherResponse getVoucherById(@PathVariable Long id) {
        return voucherService.getVoucherById(id);
    }

    @PostMapping
    public VoucherResponse createVoucher(@RequestBody VoucherRequest request) {
        return voucherService.createVoucher(request);
    }

    @PutMapping("/{id}")
    public VoucherResponse updateVoucher(@PathVariable Long id, @RequestBody VoucherRequest request) {
        return voucherService.updateVoucher(id, request);
    }

    @PatchMapping("/{id}/activate")
    public VoucherResponse activateVoucher(@PathVariable Long id) {
        return voucherService.activateVoucher(id);
    }

    @PatchMapping("/{id}/suspend")
    public VoucherResponse suspendVoucher(@PathVariable Long id) {
        return voucherService.suspendVoucher(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.noContent().build();
    }

    // Endpoint helper to simulate applying a voucher (useful for testing or frontend check before booking)
    @GetMapping("/apply-test")
    public ResponseEntity<Double> applyVoucherTest(
            @RequestParam String code,
            @RequestParam double originalPrice,
            @RequestParam int ticketCount) {
        double discountedPrice = voucherService.applyVoucher(code, originalPrice, ticketCount);
        return ResponseEntity.ok(discountedPrice);
    }
}
