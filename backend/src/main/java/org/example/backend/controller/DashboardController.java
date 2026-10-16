package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.response.DashboardChartsResponse;
import org.example.backend.dto.response.DashboardOverviewResponse;
import org.example.backend.enums.DashboardPeriod;
import org.example.backend.service.DashboardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview")
    public DashboardOverviewResponse getOverview(
            @RequestParam(defaultValue = "LAST_30_DAYS") DashboardPeriod period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        return dashboardService.getOverview(period, fromDate, toDate);
    }

    @GetMapping("/charts")
    public DashboardChartsResponse getCharts(
            @RequestParam(defaultValue = "LAST_30_DAYS") DashboardPeriod period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        return dashboardService.getCharts(period, fromDate, toDate);
    }
}
