package org.example.backend.controller;


import lombok.RequiredArgsConstructor;
import org.example.backend.entity.Customer;
import org.example.backend.service.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.example.backend.dto.response.CustomerResponse;
import org.example.backend.service.CustomerService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {
    private final CustomerService customerService;
    private final CloudinaryService cloudinaryService;

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

    @PutMapping("/me/avatar")
    public CustomerResponse updateAvatar(
            Authentication auth,
            @RequestParam MultipartFile avatar
    ) {
        String email = auth.getName();
        return customerService.updateAvatar(email, avatar);
    }







}
