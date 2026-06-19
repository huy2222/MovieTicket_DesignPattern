package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "movie_histories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovieHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // movieHistoryId

    private LocalDateTime watchedAt;
    private LocalDateTime showtime; // Có thể lưu lại giờ chiếu

    @ManyToOne
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "cinema_id")
    private Cinema cinema;

    @ManyToMany
    @JoinTable(
            name = "movie_history_genres",
            joinColumns = @JoinColumn(name = "movie_history_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private List<Genre> watchedGenres;
}
