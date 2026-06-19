package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.MovieStatus;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "movies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // movieId

    private String title;
    private String description;
    private String director;
    private String cast;
    private String country;
    private String language;
    private String ageRating;
    private int duration; // Tính bằng phút
    private String images; // Có thể lưu URL ảnh
    private String trailers; // Có thể lưu URL video
    private LocalDate releaseDate;

    @Enumerated(EnumType.STRING)
    private MovieStatus status;

    @ManyToMany
    @JoinTable(
            name = "movie_genres",
            joinColumns = @JoinColumn(name = "movie_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private List<Genre> genres;

    @OneToMany(mappedBy = "movie")
    private List<Showtime> showtimes;

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL)
    private List<Review> reviews;

    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL)
    private List<MovieHistory> movieHistories;

    // TODO: Sẽ mở comment khi làm tới phần Voucher
    @ManyToMany(mappedBy = "applicableMovies")
    private List<Voucher> applicableVouchers;
}
