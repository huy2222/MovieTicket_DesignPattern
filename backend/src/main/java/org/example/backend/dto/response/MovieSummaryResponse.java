package org.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.MovieStatus;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieSummaryResponse {
    private Long id;
    private String title;
    private String posterUrl;
    private Integer duration;
    private LocalDate releaseDate;
    private String ageRestriction;
    private MovieStatus status;
}
