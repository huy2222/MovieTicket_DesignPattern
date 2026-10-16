package org.example.backend.controller;

import org.example.backend.dto.response.MyBookingResponse;
import org.example.backend.entity.Customer;
import org.example.backend.repository.CustomerRepository;
import org.example.backend.service.BookingUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customer/bookings")
public class BookingUserController {

    private final BookingUserService bookingUserService;
    private final CustomerRepository customerRepository;

    public BookingUserController(BookingUserService bookingUserService, CustomerRepository customerRepository) {
        this.bookingUserService = bookingUserService;
        this.customerRepository = customerRepository;
    }

    @GetMapping("/my")
    public ResponseEntity<List<MyBookingResponse>> getMyBookings(Authentication authentication) {
        Long customerId = extractCustomerId(authentication);
        return ResponseEntity.ok(bookingUserService.getMyBookings(customerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MyBookingResponse> getBookingDetail(
            @PathVariable Long id,
            Authentication authentication) {
        Long customerId = extractCustomerId(authentication);
        return ResponseEntity.ok(bookingUserService.getBookingDetail(id, customerId));
    }

    private Long extractCustomerId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Chưa đăng nhập");
        }
        String email = authentication.getName();
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        return customer.getId();
    }
}
