package org.example.backend.repository.projection;

public interface DailyTicketProjection {
    java.sql.Date getSaleDate();

    Long getTicketCount();
}
