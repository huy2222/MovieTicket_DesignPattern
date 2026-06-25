package org.example.backend.controller;


import org.springframework.security.core.Authentication;
import org.example.backend.dto.response.CustomerResponse;
import org.example.backend.service.CustomerService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CustomerService customerService;
    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/me")
    public CustomerResponse getMyProfile(Authentication auth) {
        String email = auth.getName();
        return customerService.getCustomerByEmail(email);
    }

    @PutMapping("/me")
    public CustomerResponse updateMyProfile(Authentication auth, @RequestBody CustomerResponse updatedProfile) {
        String email = auth.getName();
        return customerService.updateCustomerProfile(email, updatedProfile);
    }




}
