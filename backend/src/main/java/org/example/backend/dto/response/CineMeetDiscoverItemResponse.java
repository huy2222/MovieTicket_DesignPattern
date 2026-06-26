package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CineMeetDiscoverItemResponse {
    private Long customerId;
    private String avatar;
    private String name;
    private Integer age;
    private String bio;
    private Double distanceKm;
    private List<String> favoriteGenres;
    private List<String> frequentCinemas;
    private Double compatibilityScore;
}
