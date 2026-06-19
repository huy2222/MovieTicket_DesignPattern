package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.BookingStatus;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // bookingId

    private LocalDateTime bookingDate;
    private LocalDateTime paymentDeadline;
    private double basePrice;
    private double discountAmount;
    private double subtotal;
    private double totalAmount;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "showtime_id")
    private Showtime showtime;

    @ManyToOne
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    private List<Ticket> tickets;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    private List<Payment> payments;

    // Thêm thuộc tính này vào class Booking
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL)
    private List<SeatHold> seatHolds;

    @ManyToOne
    @JoinColumn(name = "group_booking_session_id")
    private GroupBookingSession groupBookingSession;
}
