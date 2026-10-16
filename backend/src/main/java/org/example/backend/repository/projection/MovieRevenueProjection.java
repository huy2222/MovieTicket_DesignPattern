package org.example.backend.repository.projection;

public interface MovieRevenueProjection {
    Long getMovieId();

    String getMovieTitle();

    Double getRevenue();
}
