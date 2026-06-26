package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.ShowtimeStatus;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "showtimes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Showtime {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // showtimeId

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private double basePrice;

    @Enumerated(EnumType.STRING)
    private ShowtimeStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cinema_id")
    private Cinema cinema;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @OneToMany(mappedBy = "showtime", cascade = CascadeType.ALL)
    private List<SeatHold> seatHolds;

    @ManyToMany
    @JoinTable(
            name = "showtime_vouchers",
            joinColumns = @JoinColumn(name = "showtime_id"),
            inverseJoinColumns = @JoinColumn(name = "voucher_id")
    )
    private List<Voucher> vouchers;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @OneToMany(mappedBy = "showtime")
    private List<Booking> bookings;

    @OneToMany(mappedBy = "showtime")
    private List<Ticket> tickets;
}
