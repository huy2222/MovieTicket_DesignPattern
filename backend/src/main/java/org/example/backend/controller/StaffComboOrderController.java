package org.example.backend.controller;

import org.example.backend.dto.response.BookingComboResponse;
import org.example.backend.dto.response.StaffComboOrderResponse;
import org.example.backend.service.StaffComboService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff/combo-orders")
public class StaffComboOrderController {

    private final StaffComboService staffComboService;

    public StaffComboOrderController(StaffComboService staffComboService) {
        this.staffComboService = staffComboService;
    }

    @GetMapping("/search")
    public ResponseEntity<StaffComboOrderResponse> searchComboOrders(
            @RequestParam("bookingCode") String bookingCode,
            Authentication authentication
    ) {
        String staffEmail = authentication != null ? authentication.getName() : null;
        StaffComboOrderResponse response = staffComboService.searchComboOrder(bookingCode, staffEmail);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/receive")
    public ResponseEntity<BookingComboResponse> confirmComboReceived(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        String staffEmail = authentication != null ? authentication.getName() : null;
        BookingComboResponse response = staffComboService.confirmComboReceived(id, staffEmail);
        return ResponseEntity.ok(response);
    }
}
