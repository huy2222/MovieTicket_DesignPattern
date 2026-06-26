package org.example.backend.controller;


import lombok.RequiredArgsConstructor;
import org.example.backend.service.CustomerService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
public class ManagerCustomerController {
    private final CustomerService customerService;

    @GetMapping
    public Object getAllCustomersForAdmin() {
        return customerService.getAllCustomersForAdmin();
    }
}
