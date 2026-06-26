package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CineMeetProfileResponse {
    private Long customerId;
    private Long profileId;
    private String displayName;
    private Integer age;
    private String avatarUrl;
    private String bio;
    private boolean cineMeetEnabled;
    private boolean visibleToCustomer;
    private Double compatibilityScore;
    private Double distanceInKm;
    private Long frequentCinemaId;
    private String frequentCinemaName;
    private List<GenreItem> favoriteGenres;

    @Data
    @Builder
    public static class GenreItem {
        private Long id;
        private String name;
    }
}
