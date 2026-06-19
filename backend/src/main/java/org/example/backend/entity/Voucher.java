package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.VoucherStatus;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vouchers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // voucherId

    private String name;
    private String code;
    private String description;
    private double discountValue;
    private double minimumOrderAmount;
    private int usageLimit;
    private int usedCount;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    private VoucherStatus status;

    @ManyToMany
    @JoinTable(
            name = "voucher_cinemas",
            joinColumns = @JoinColumn(name = "voucher_id"),
            inverseJoinColumns = @JoinColumn(name = "cinema_id")
    )
    private List<Cinema> applicableCinemas;

    @ManyToMany
    @JoinTable(
            name = "voucher_movies",
            joinColumns = @JoinColumn(name = "voucher_id"),
            inverseJoinColumns = @JoinColumn(name = "movie_id")
    )
    private List<Movie> applicableMovies;

    @OneToMany(mappedBy = "voucher")
    private List<Booking> appliedBookings;
}
