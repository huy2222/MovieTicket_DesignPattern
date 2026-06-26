package org.example.backend.repository.projection;

public interface MovieTicketCountProjection {
    Long getMovieId();

    String getMovieTitle();

    Long getTicketCount();
}
