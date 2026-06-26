package org.example.backend.repository.projection;

public interface MonthlyRevenueProjection {
    Integer getYear();

    Integer getMonth();

    Double getRevenue();
}
