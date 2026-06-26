package org.example.backend.controller;


import lombok.RequiredArgsConstructor;
import org.example.backend.dto.response.CustomerResponseAdmin;
import org.example.backend.dto.response.CustomerDetailResponse;
import org.example.backend.service.CustomerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
public class ManagerCustomerController {
    private final CustomerService customerService;

    @GetMapping
    public List<CustomerResponseAdmin> getAllCustomersForAdmin() {
        return customerService.getAllCustomersForAdmin();
    }
    @PutMapping("/{customerId}/block")
    public void lockCustomerAccount(@PathVariable Long customerId) {
        customerService.BlockCustomerAccount(customerId);
    }
    @PutMapping("/{customerId}/unblock")
    public void UnBlockCustomerAccount(@PathVariable  Long customerId) {
        customerService.UnBlockCustomerAccount(customerId);
    }
    @GetMapping("/{customerId}")
    public CustomerDetailResponse getCustomerDetail(
            @PathVariable Long customerId) {

        return customerService.getCustomerDetail(customerId);
    }
}
