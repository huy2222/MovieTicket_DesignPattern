package org.example.backend.controller;

import org.example.backend.dto.request.GroupPaymentRequest;
import org.example.backend.dto.request.MovieInvitationRequest;
import org.example.backend.dto.request.SeatSelectionRequest;
import org.example.backend.dto.response.GroupBookingResponse;
import org.example.backend.dto.response.MovieInvitationResponse;
import org.example.backend.dto.response.ShowtimeResponse;
import org.example.backend.enums.ShowtimeStatus;
import org.example.backend.service.GroupBookingService;
import org.example.backend.service.MovieInvitationService;
import org.example.backend.service.ShowtimeService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/cinemeet")
public class CineMeetGroupController {
    private final MovieInvitationService invitationService;
    private final GroupBookingService groupBookingService;
    private final ShowtimeService showtimeService;

    public CineMeetGroupController(
            MovieInvitationService invitationService,
            GroupBookingService groupBookingService,
            ShowtimeService showtimeService
    ) {
        this.invitationService = invitationService;
        this.groupBookingService = groupBookingService;
        this.showtimeService = showtimeService;
    }

    @GetMapping("/showtimes")
    public List<ShowtimeResponse> getAvailableShowtimes() {
        return showtimeService.getShowtimes(null, null, null, null, ShowtimeStatus.AVAILABLE);
    }

    @GetMapping("/matches/{matchId}/invitations")
    public List<MovieInvitationResponse> getInvitations(Principal principal, @PathVariable Long matchId) {
        return invitationService.getInvitations(principal.getName(), matchId);
    }

    @PostMapping("/matches/{matchId}/invitations")
    @ResponseStatus(HttpStatus.CREATED)
    public MovieInvitationResponse createInvitation(
            Principal principal,
            @PathVariable Long matchId,
            @RequestBody MovieInvitationRequest request
    ) {
        return invitationService.createInvitation(principal.getName(), matchId, request);
    }

    @PostMapping("/matches/{matchId}/invitations/{invitationId}/accept")
    public MovieInvitationResponse acceptInvitation(
            Principal principal, @PathVariable Long matchId, @PathVariable Long invitationId) {
        return invitationService.acceptInvitation(principal.getName(), matchId, invitationId);
    }

    @PostMapping("/matches/{matchId}/invitations/{invitationId}/reject")
    public MovieInvitationResponse rejectInvitation(
            Principal principal, @PathVariable Long matchId, @PathVariable Long invitationId) {
        return invitationService.rejectInvitation(principal.getName(), matchId, invitationId);
    }

    @PostMapping("/matches/{matchId}/invitations/{invitationId}/cancel")
    public MovieInvitationResponse cancelInvitation(
            Principal principal, @PathVariable Long matchId, @PathVariable Long invitationId) {
        return invitationService.cancelInvitation(principal.getName(), matchId, invitationId);
    }

    @GetMapping("/groups")
    public List<GroupBookingResponse> getMyGroups(Principal principal) {
        return groupBookingService.getMyGroups(principal.getName());
    }

    @GetMapping("/matches/{matchId}/group")
    public GroupBookingResponse getGroupForMatch(Principal principal, @PathVariable Long matchId) {
        return groupBookingService.getGroupForMatch(principal.getName(), matchId);
    }

    @GetMapping("/groups/{groupId}")
    public GroupBookingResponse getGroup(Principal principal, @PathVariable Long groupId) {
        return groupBookingService.getGroup(principal.getName(), groupId);
    }

    @GetMapping("/groups/{groupId}/seats")
    public org.example.backend.dto.response.GroupBookingSeatResponse getGroupSeats(Principal principal, @PathVariable Long groupId) {
        return groupBookingService.getGroupSeats(principal.getName(), groupId);
    }

    @PostMapping("/groups/{groupId}/seat")
    public GroupBookingResponse selectSeat(
            Principal principal, @PathVariable Long groupId, @RequestBody SeatSelectionRequest request) {
        return groupBookingService.selectSeat(principal.getName(), groupId, request.getSeatId());
    }

    @PostMapping("/groups/{groupId}/payment")
    public GroupBookingResponse updatePayment(
            Principal principal, @PathVariable Long groupId, @RequestBody GroupPaymentRequest request) {
        return groupBookingService.updatePaymentStatus(
                principal.getName(), groupId, request.getStatus());
    }

    @PostMapping("/groups/{groupId}/cancel")
    public GroupBookingResponse cancelGroup(Principal principal, @PathVariable Long groupId) {
        return groupBookingService.cancelGroup(principal.getName(), groupId);
    }
}
