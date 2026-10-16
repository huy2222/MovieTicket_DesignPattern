package org.example.backend.controller;

import org.example.backend.dto.response.GroupBookingResponse;
import org.example.backend.enums.GroupMemberStatus;
import org.example.backend.service.GroupBookingService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/cinemeet/group-bookings")
public class GroupBookingController {

    private final GroupBookingService groupBookingService;

    public GroupBookingController(GroupBookingService groupBookingService) {
        this.groupBookingService = groupBookingService;
    }

    @GetMapping("/match/{matchId}")
    public GroupBookingResponse getGroupForMatch(Principal principal, @PathVariable Long matchId) {
        return groupBookingService.getGroupForMatch(principal.getName(), matchId);
    }

    @GetMapping("/{groupId}")
    public GroupBookingResponse getGroup(Principal principal, @PathVariable Long groupId) {
        return groupBookingService.getGroup(principal.getName(), groupId);
    }

    @GetMapping("/{groupId}/seats")
    public org.example.backend.dto.response.GroupBookingSeatResponse getGroupSeats(Principal principal, @PathVariable Long groupId) {
        return groupBookingService.getGroupSeats(principal.getName(), groupId);
    }

    @PostMapping("/{groupId}/seats/{seatId}")
    public GroupBookingResponse selectSeat(
            Principal principal,
            @PathVariable Long groupId,
            @PathVariable Long seatId) {
        return groupBookingService.selectSeat(principal.getName(), groupId, seatId);
    }

    @PostMapping("/{groupId}/payment/vnpay-url")
    public java.util.Map<String, String> createVNPayUrl(
            Principal principal,
            @PathVariable Long groupId,
            jakarta.servlet.http.HttpServletRequest request) {
        String url = groupBookingService.createVNPayUrl(principal.getName(), groupId, request);
        return java.util.Map.of("url", url);
    }

    @GetMapping("/vnpay-return")
    public org.springframework.http.ResponseEntity<Void> handleVNPayReturn(@RequestParam java.util.Map<String, String> params) {
        String frontendUrl = "http://localhost:5173/cinemeet/payment/result";
        try {
            groupBookingService.handleVNPayReturn(params);
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

    @PostMapping("/{groupId}/payment")
    public GroupBookingResponse updatePaymentStatus(
            Principal principal,
            @PathVariable Long groupId,
            @RequestParam GroupMemberStatus status) {
        return groupBookingService.updatePaymentStatus(principal.getName(), groupId, status);
    }

    @DeleteMapping("/{groupId}")
    public GroupBookingResponse cancelGroup(Principal principal, @PathVariable Long groupId) {
        return groupBookingService.cancelGroup(principal.getName(), groupId);
    }
}
