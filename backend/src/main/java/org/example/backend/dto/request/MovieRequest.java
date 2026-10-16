package org.example.backend.dto.request;

import lombok.Data;
import org.example.backend.enums.MovieStatus;

import java.time.LocalDate;
import java.util.List;

@Data
public class MovieRequest {
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
    private List<String> directorNames;
    private List<String> actorNames;
    private String ageRestriction;
    private MovieStatus status;
}
