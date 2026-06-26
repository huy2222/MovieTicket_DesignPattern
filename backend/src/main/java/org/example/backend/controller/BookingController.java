package org.example.backend.controller;

import org.example.backend.service.BookingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/cities")
    public List<String> getCitiesWithShowtimes(
            @RequestParam Long movieId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return bookingService.getCitiesWithShowtimes(movieId, date);
    }

    @GetMapping("/cinemas")
    public List<org.example.backend.dto.response.CinemaShowtimesResponse> getCinemasAndShowtimes(
            @RequestParam Long movieId,
            @RequestParam String city,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return bookingService.getCinemasAndShowtimes(movieId, city, date);
    }

    @GetMapping("/showtimes/{showtimeId}/seats")
    public org.example.backend.dto.response.ShowtimeSeatsResponse getShowtimeSeats(@org.springframework.web.bind.annotation.PathVariable Long showtimeId) {
        return bookingService.getShowtimeSeats(showtimeId);
    }

    @PostMapping("/checkout")
    public org.springframework.http.ResponseEntity<org.example.backend.dto.response.CheckoutResponse> checkout(
            @org.springframework.web.bind.annotation.RequestBody org.example.backend.dto.request.BookingRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest) {
        return org.springframework.http.ResponseEntity.ok(bookingService.checkout(request, httpRequest));
    }

    @GetMapping("/vnpay-return")
    public org.springframework.http.ResponseEntity<Void> handleVNPayReturn(@org.springframework.web.bind.annotation.RequestParam java.util.Map<String, String> params) {
        String frontendUrl = "http://localhost:5173/payment/result";
        try {
            bookingService.handleVNPayReturn(params);
            String responseCode = params.get("vnp_ResponseCode");
            if ("00".equals(responseCode)) {
                return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.FOUND)
                        .location(java.net.URI.create(frontendUrl + "?status=success"))
                        .build();
            } else {
                return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.FOUND)
                        .location(java.net.URI.create(frontendUrl + "?status=failed"))
                        .build();
            }
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.FOUND)
                    .location(java.net.URI.create(frontendUrl + "?status=error"))
                    .build();
        }
    }

    @GetMapping("/debug/seats-count")
    public java.util.Map<String, Object> debugSeats() {
        return bookingService.debugSeatCounts();
    }
}
