package org.example.backend.repository;

import org.example.backend.entity.Booking;
import org.example.backend.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
            SELECT COUNT(b)
            FROM Booking b
            WHERE b.status = :status
            """)
    long countByStatus(@Param("status") BookingStatus status);

    @Query("""
            SELECT COUNT(b)
            FROM Booking b
            WHERE b.status = :status
              AND b.bookingDate >= :start
              AND b.bookingDate < :end
            """)
    long countByStatusAndBookingDateBetween(
            @Param("status") BookingStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
}
