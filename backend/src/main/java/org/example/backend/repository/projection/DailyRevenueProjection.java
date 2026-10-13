package org.example.backend.repository.projection;

public interface DailyRevenueProjection {
    java.sql.Date getRevenueDate();

    Double getRevenue();
}
