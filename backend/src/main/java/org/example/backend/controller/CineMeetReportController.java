package org.example.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.CreateCineMeetReportRequest;
import org.example.backend.dto.request.ResolveCineMeetReportRequest;
import org.example.backend.dto.response.CineMeetReportResponse;
import org.example.backend.dto.response.MyCineMeetReportResponse;
import org.example.backend.enums.CineMeetReportStatus;
import org.example.backend.service.CineMeetReportService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class CineMeetReportController {
    private final CineMeetReportService reportService;

    @PostMapping("/api/cinemeet/reports")
    @ResponseStatus(HttpStatus.CREATED)
    public CineMeetReportResponse create(
            Principal principal,
            @Valid @RequestBody CreateCineMeetReportRequest request
    ) {
        return reportService.create(principal.getName(), request);
    }

    @GetMapping("/api/cinemeet/reports")
    public List<MyCineMeetReportResponse> findMine(Principal principal) {
        return reportService.findMine(principal.getName());
    }

    @GetMapping("/api/admin/cinemeet/reports")
    public List<CineMeetReportResponse> findAll(
            @RequestParam(required = false) CineMeetReportStatus status
    ) {
        return reportService.findAll(status);
    }

    @GetMapping("/api/admin/cinemeet/reports/{id}")
    public CineMeetReportResponse findById(@PathVariable Long id) {
        return reportService.findById(id);
    }

    @PutMapping("/api/admin/cinemeet/reports/{id}/review")
    public CineMeetReportResponse startReview(Principal principal, @PathVariable Long id) {
        return reportService.startReview(principal.getName(), id);
    }

    @PutMapping("/api/admin/cinemeet/reports/{id}/resolve")
    public CineMeetReportResponse resolve(
            Principal principal,
            @PathVariable Long id,
            @Valid @RequestBody ResolveCineMeetReportRequest request
    ) {
        return reportService.resolve(principal.getName(), id, request);
    }
}
