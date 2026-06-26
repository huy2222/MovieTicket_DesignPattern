package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardSlowStats {
    private long totalTicketsSold;
    private long totalBookings;
    private long totalCustomers;
    private long moviesNowShowing;
    private long totalEmployees;
}
