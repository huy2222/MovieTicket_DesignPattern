package org.example.backend.repository.projection;

public interface HourlyRevenueProjection {
    Integer getHourOfDay();

    Double getRevenue();
}
