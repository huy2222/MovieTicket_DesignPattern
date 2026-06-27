package org.example.backend.repository;

import org.example.backend.entity.Payment;
import org.example.backend.enums.PaymentStatus;
import org.example.backend.repository.projection.CinemaRevenueProjection;
import org.example.backend.repository.projection.HourlyRevenueProjection;
import org.example.backend.repository.projection.MonthlyRevenueProjection;
import org.example.backend.repository.projection.MovieRevenueProjection;
import org.example.backend.repository.projection.MovieTicketCountProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("""
            SELECT COALESCE(SUM(p.amount), 0)
            FROM Payment p
            WHERE p.status = :status
              AND p.paidAt >= :start
              AND p.paidAt < :end
            """)
    Double sumRevenueByPaidAtBetween(
            @Param("status") PaymentStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
            SELECT YEAR(p.paidAt) AS year,
                   MONTH(p.paidAt) AS month,
                   COALESCE(SUM(p.amount), 0) AS revenue
            FROM Payment p
            WHERE p.status = :status
              AND p.paidAt >= :start
              AND p.paidAt < :end
            GROUP BY YEAR(p.paidAt), MONTH(p.paidAt)
            ORDER BY YEAR(p.paidAt), MONTH(p.paidAt)
            """)
    List<MonthlyRevenueProjection> sumRevenueGroupByMonth(
            @Param("status") PaymentStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
            SELECT m.id AS movieId,
                   m.title AS movieTitle,
                   COALESCE(SUM(p.amount), 0) AS revenue
            FROM Payment p
            JOIN p.booking b
            JOIN b.showtime s
            JOIN s.movie m
            WHERE p.status = :status
              AND p.paidAt >= :start
              AND p.paidAt < :end
            GROUP BY m.id, m.title
            ORDER BY SUM(p.amount) DESC
            """)
    List<MovieRevenueProjection> topMoviesByRevenue(
            @Param("status") PaymentStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
            SELECT c.id AS cinemaId,
                   c.name AS cinemaName,
                   COALESCE(SUM(p.amount), 0) AS revenue
            FROM Payment p
            JOIN p.booking b
            JOIN b.showtime s
            JOIN s.cinema c
            WHERE p.status = :status
              AND p.paidAt >= :start
              AND p.paidAt < :end
            GROUP BY c.id, c.name
            ORDER BY SUM(p.amount) DESC
            """)
    List<CinemaRevenueProjection> revenueByCinema(
            @Param("status") PaymentStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("""
            SELECT FUNCTION('HOUR', s.startTime) AS hourOfDay,
                   COALESCE(SUM(p.amount), 0) AS revenue
            FROM Payment p
            JOIN p.booking b
            JOIN b.showtime s
            WHERE p.status = :status
              AND p.paidAt >= :start
              AND p.paidAt < :end
            GROUP BY FUNCTION('HOUR', s.startTime)
            ORDER BY FUNCTION('HOUR', s.startTime)
            """)
    List<HourlyRevenueProjection> revenueByHour(
            @Param("status") PaymentStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
    Optional<Payment> findByTransactionCode(String transactionCode);
}
