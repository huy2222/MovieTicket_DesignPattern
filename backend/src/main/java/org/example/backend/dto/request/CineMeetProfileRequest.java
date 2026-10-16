package org.example.backend.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class CineMeetProfileRequest {
    private String displayName;
    private Integer age;
    private String avatarUrl;
    private String bio;
    private Boolean cineMeetEnabled;
    private Boolean visibleToCustomer;
    private List<Long> favoriteGenreIds;
    private Long frequentCinemaId;
}
