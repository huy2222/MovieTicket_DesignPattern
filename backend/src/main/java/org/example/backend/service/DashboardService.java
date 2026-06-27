package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.response.DashboardChartsResponse;
import org.example.backend.dto.response.DashboardOverviewResponse;
import org.example.backend.dto.response.DashboardSlowStats;
import org.example.backend.enums.BookingStatus;
import org.example.backend.enums.DashboardPeriod;
import org.example.backend.enums.MovieStatus;
import org.example.backend.enums.PaymentStatus;
import org.example.backend.enums.Role;
import org.example.backend.repository.AdminRepository;
import org.example.backend.repository.BookingRepository;
import org.example.backend.repository.CustomerRepository;
import org.example.backend.repository.MovieRepository;
import org.example.backend.repository.PaymentRepository;
import org.example.backend.repository.ShowtimeRepository;
import org.example.backend.repository.StaffRepository;
import org.example.backend.repository.TicketRepository;
import org.example.backend.repository.projection.CinemaRevenueProjection;
import org.example.backend.repository.projection.DailyTicketProjection;
import org.example.backend.repository.projection.HourlyRevenueProjection;
import org.example.backend.repository.projection.MonthlyRevenueProjection;
import org.example.backend.repository.projection.MovieRevenueProjection;
import org.example.backend.repository.projection.MovieTicketCountProjection;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final int TOP_LIMIT = 10;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final CustomerRepository customerRepository;
    private final MovieRepository movieRepository;
    private final ShowtimeRepository showtimeRepository;
    private final AdminRepository adminRepository;
    private final StaffRepository staffRepository;

    @Transactional(readOnly = true)
    public DashboardOverviewResponse getOverview(
            DashboardPeriod period,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        DateRange range = resolveDateRange(period, fromDate, toDate);

        LocalDateTime start = range.from().atStartOfDay();
        LocalDateTime end = range.to().plusDays(1).atStartOfDay();

        double revenue = safeRevenue(start, end);
        long showtimesCount = showtimeRepository.countByStartTimeBetween(start, end);

        DashboardSlowStats slowStats = getSlowStats();

        return DashboardOverviewResponse.builder()
                .revenueToday(revenue)
                .revenueThisWeek(revenue)
                .revenueThisMonth(revenue)
                .revenueThisYear(revenue)
                .totalTicketsSold(slowStats.getTotalTicketsSold())
                .totalBookings(slowStats.getTotalBookings())
                .totalCustomers(slowStats.getTotalCustomers())
                .moviesNowShowing(slowStats.getMoviesNowShowing())
                .showtimesToday(showtimesCount)
                .totalEmployees(slowStats.getTotalEmployees())
                .build();
    }

    @Transactional(readOnly = true)
    @Cacheable("dashboardSlowStats")
    public DashboardSlowStats getSlowStats() {
        return DashboardSlowStats.builder()
                .totalTicketsSold(ticketRepository.countAllTickets())
                .totalBookings(bookingRepository.countByStatus(BookingStatus.CONFIRMED))
                .totalCustomers(customerRepository.count())
                .moviesNowShowing(movieRepository.countByStatus(MovieStatus.NOW_SHOWING))
                .totalEmployees(adminRepository.countByRole(Role.ADMIN) + staffRepository.countAllStaff())
                .build();
    }

    @CacheEvict(value = "dashboardSlowStats", allEntries = true)
    public void evictSlowStatsCache() {
        // Called after employee/customer/movie mutations
    }

    @Transactional(readOnly = true)
    public DashboardChartsResponse getCharts(
            DashboardPeriod period,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        DateRange range = resolveDateRange(period, fromDate, toDate);

        LocalDateTime chartStart = range.from().atStartOfDay();
        LocalDateTime chartEnd = range.to().plusDays(1).atStartOfDay();

        LocalDateTime monthlyStart = range.to().minusMonths(11).withDayOfMonth(1).atStartOfDay();
        LocalDateTime monthlyEnd = range.to().plusMonths(1).withDayOfMonth(1).atStartOfDay();

        return DashboardChartsResponse.builder()
                .period(period.name())
                .fromDate(range.from().format(DATE_FORMAT))
                .toDate(range.to().format(DATE_FORMAT))
                .monthlyRevenue(buildMonthlyRevenue(monthlyStart, monthlyEnd))
                .topMoviesByRevenue(buildTopMoviesByRevenue(chartStart, chartEnd))
                .topMoviesByTickets(buildTopMoviesByTickets(chartStart, chartEnd))
                .revenueByCinema(buildRevenueByCinema(chartStart, chartEnd))
                .ticketsSoldByDay(buildTicketsSoldByDay(chartStart, chartEnd))
                .revenueByHour(buildRevenueByHour(chartStart, chartEnd))
                .build();
    }

    private double safeRevenue(LocalDateTime start, LocalDateTime end) {
        Double value = paymentRepository.sumRevenueByPaidAtBetween(PaymentStatus.PAID, start, end);
        return value != null ? value : 0.0;
    }

    private List<DashboardChartsResponse.MonthlyRevenueItem> buildMonthlyRevenue(
            LocalDateTime start,
            LocalDateTime end
    ) {
        List<MonthlyRevenueProjection> rows = paymentRepository.sumRevenueGroupByMonth(
                PaymentStatus.PAID, start, end
        );

        Map<String, Double> revenueMap = new HashMap<>();
        for (MonthlyRevenueProjection row : rows) {
            revenueMap.put(row.getYear() + "-" + row.getMonth(), row.getRevenue() != null ? row.getRevenue() : 0.0);
        }

        List<DashboardChartsResponse.MonthlyRevenueItem> items = new ArrayList<>();
        YearMonth cursor = YearMonth.from(start);
        YearMonth last = YearMonth.from(end.minusDays(1));

        while (!cursor.isAfter(last)) {
            String key = cursor.getYear() + "-" + cursor.getMonthValue();
            items.add(DashboardChartsResponse.MonthlyRevenueItem.builder()
                    .year(cursor.getYear())
                    .month(cursor.getMonthValue())
                    .label(String.format("%02d/%d", cursor.getMonthValue(), cursor.getYear()))
                    .revenue(revenueMap.getOrDefault(key, 0.0))
                    .build());
            cursor = cursor.plusMonths(1);
        }

        return items;
    }

    private List<DashboardChartsResponse.MovieRevenueItem> buildTopMoviesByRevenue(
            LocalDateTime start,
            LocalDateTime end
    ) {
        return paymentRepository.topMoviesByRevenue(PaymentStatus.PAID, start, end).stream()
                .limit(TOP_LIMIT)
                .map(this::toMovieRevenueItem)
                .toList();
    }

    private List<DashboardChartsResponse.MovieTicketItem> buildTopMoviesByTickets(
            LocalDateTime start,
            LocalDateTime end
    ) {
        return ticketRepository.topMoviesByTicketCount(start, end).stream()
                .limit(TOP_LIMIT)
                .map(this::toMovieTicketItem)
                .toList();
    }

    private List<DashboardChartsResponse.CinemaRevenueItem> buildRevenueByCinema(
            LocalDateTime start,
            LocalDateTime end
    ) {
        return paymentRepository.revenueByCinema(PaymentStatus.PAID, start, end).stream()
                .map(this::toCinemaRevenueItem)
                .toList();
    }

    private List<DashboardChartsResponse.DailyTicketItem> buildTicketsSoldByDay(
            LocalDateTime start,
            LocalDateTime end
    ) {
        Map<LocalDate, Long> ticketMap = new HashMap<>();
        for (DailyTicketProjection row : ticketRepository.ticketsSoldByDay(start, end)) {
            if (row.getSaleDate() != null) {
                ticketMap.put(row.getSaleDate().toLocalDate(), row.getTicketCount());
            }
        }

        List<DashboardChartsResponse.DailyTicketItem> items = new ArrayList<>();
        LocalDate cursor = start.toLocalDate();
        LocalDate endDate = end.toLocalDate().minusDays(1);

        while (!cursor.isAfter(endDate)) {
            items.add(DashboardChartsResponse.DailyTicketItem.builder()
                    .date(cursor.format(DATE_FORMAT))
                    .ticketCount(ticketMap.getOrDefault(cursor, 0L))
                    .build());
            cursor = cursor.plusDays(1);
        }

        return items;
    }

    private List<DashboardChartsResponse.HourlyRevenueItem> buildRevenueByHour(
            LocalDateTime start,
            LocalDateTime end
    ) {
        Map<Integer, Double> hourMap = new HashMap<>();
        for (HourlyRevenueProjection row : paymentRepository.revenueByHour(PaymentStatus.PAID, start, end)) {
            hourMap.put(row.getHourOfDay(), row.getRevenue() != null ? row.getRevenue() : 0.0);
        }

        List<DashboardChartsResponse.HourlyRevenueItem> items = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            items.add(DashboardChartsResponse.HourlyRevenueItem.builder()
                    .hour(hour)
                    .label(String.format("%02d:00", hour))
                    .revenue(hourMap.getOrDefault(hour, 0.0))
                    .build());
        }
        return items;
    }

    private DashboardChartsResponse.MovieRevenueItem toMovieRevenueItem(MovieRevenueProjection row) {
        return DashboardChartsResponse.MovieRevenueItem.builder()
                .movieId(row.getMovieId())
                .movieTitle(row.getMovieTitle())
                .revenue(row.getRevenue() != null ? row.getRevenue() : 0.0)
                .build();
    }

    private DashboardChartsResponse.MovieTicketItem toMovieTicketItem(MovieTicketCountProjection row) {
        return DashboardChartsResponse.MovieTicketItem.builder()
                .movieId(row.getMovieId())
                .movieTitle(row.getMovieTitle())
                .ticketCount(row.getTicketCount() != null ? row.getTicketCount() : 0L)
                .build();
    }

    private DashboardChartsResponse.CinemaRevenueItem toCinemaRevenueItem(CinemaRevenueProjection row) {
        return DashboardChartsResponse.CinemaRevenueItem.builder()
                .cinemaId(row.getCinemaId())
                .cinemaName(row.getCinemaName())
                .revenue(row.getRevenue() != null ? row.getRevenue() : 0.0)
                .build();
    }

    private DateRange resolveDateRange(DashboardPeriod period, LocalDate fromDate, LocalDate toDate) {
        LocalDate today = LocalDate.now();

        return switch (period) {
            case TODAY -> new DateRange(today, today);
            case LAST_7_DAYS -> new DateRange(today.minusDays(6), today);
            case LAST_30_DAYS -> new DateRange(today.minusDays(29), today);
            case MONTH -> new DateRange(today.withDayOfMonth(1), today);
            case YEAR -> new DateRange(today.withDayOfYear(1), today);
            case CUSTOM -> {
                if (fromDate == null || toDate == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fromDate và toDate là bắt buộc với bộ lọc CUSTOM");
                }
                if (fromDate.isAfter(toDate)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "fromDate phải nhỏ hơn hoặc bằng toDate");
                }
                yield new DateRange(fromDate, toDate);
            }
        };
    }

    private record DateRange(LocalDate from, LocalDate to) {
    }
}
