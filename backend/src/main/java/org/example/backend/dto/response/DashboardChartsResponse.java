package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardChartsResponse {
    private String period;
    private String fromDate;
    private String toDate;
    private List<MonthlyRevenueItem> monthlyRevenue;
    private List<MovieRevenueItem> topMoviesByRevenue;
    private List<MovieTicketItem> topMoviesByTickets;
    private List<CinemaRevenueItem> revenueByCinema;
    private List<DailyTicketItem> ticketsSoldByDay;
    private List<HourlyRevenueItem> revenueByHour;

    @Data
    @Builder
    public static class MonthlyRevenueItem {
        private int year;
        private int month;
        private String label;
        private double revenue;
    }

    @Data
    @Builder
    public static class MovieRevenueItem {
        private Long movieId;
        private String movieTitle;
        private double revenue;
    }

    @Data
    @Builder
    public static class MovieTicketItem {
        private Long movieId;
        private String movieTitle;
        private long ticketCount;
    }

    @Data
    @Builder
    public static class CinemaRevenueItem {
        private Long cinemaId;
        private String cinemaName;
        private double revenue;
    }

    @Data
    @Builder
    public static class DailyTicketItem {
        private String date;
        private long ticketCount;
    }

    @Data
    @Builder
    public static class HourlyRevenueItem {
        private int hour;
        private String label;
        private double revenue;
    }
}
