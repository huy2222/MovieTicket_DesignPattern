package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardOverviewResponse {
    private double revenueToday;
    private double revenueThisWeek;
    private double revenueThisMonth;
    private double revenueThisYear;
    private long totalTicketsSold;
    private long totalBookings;
    private long totalCustomers;
    private long moviesNowShowing;
    private long showtimesToday;
    private long totalEmployees;
}
