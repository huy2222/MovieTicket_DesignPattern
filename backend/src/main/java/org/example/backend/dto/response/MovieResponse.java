package org.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.MovieStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieResponse {
    private Long id;
    private String title;
    private String englishTitle;
    private String description;
    private String posterUrl;
    private String bannerUrl;
    private String trailerUrl;
    private Integer duration;
    private LocalDate releaseDate;
    private String country;
    private String language;
    private List<Long> genreIds;
    private List<String> genres;
    private List<String> directorNames;
    private List<String> actorNames;
    private String ageRestriction;
    private MovieStatus status;
    private String createdBy;
    private LocalDateTime createdAt;
    private Double averageRating;
    private boolean hasRelatedData;
    private boolean deletable;
}
