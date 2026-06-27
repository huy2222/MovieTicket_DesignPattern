package org.example.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileCardResponse {
    private Long id; // profileCardId
    private Integer age;
    private String avatarUrl;
    @JsonProperty("cineMeetEnabled")
    private Boolean cineMeetEnabled;
    private String bio;
    private List<Long> favoriteGenreIds;
    private List<GenreResponse> favoriteGenres;
}
