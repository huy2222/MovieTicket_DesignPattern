package org.example.backend.dto;

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
public class MovieSearchRequest {
    private Long id;
    private String keyword;
    private List<Long> genreIds;
    private MovieStatus status;
    private String director;
    private String actor;
    private String language;
    private String country;
    private Integer minDuration;
    private Integer maxDuration;
    private LocalDate releaseFrom;
    private LocalDate releaseTo;
    private LocalDateTime createdFrom;
    private LocalDateTime createdTo;
    private String createdBy;
    private String ageRating;

    // Phân trang & Sắp xếp
    @Builder.Default
    private int page = 0;
    @Builder.Default
    private int size = 10;
    @Builder.Default
    private String sortBy = "releaseDate";
    @Builder.Default
    private String sortDirection = "desc";

    @Builder.Default
    private boolean adminContext = false;
}
