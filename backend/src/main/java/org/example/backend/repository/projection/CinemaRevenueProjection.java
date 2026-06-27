package org.example.backend.repository.projection;

public interface CinemaRevenueProjection {
    Long getCinemaId();

    String getCinemaName();

    Double getRevenue();
}
