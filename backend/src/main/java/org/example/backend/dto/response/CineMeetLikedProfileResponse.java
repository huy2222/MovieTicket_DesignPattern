package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CineMeetLikedProfileResponse {
    private Long customerId;
    private String avatar;
    private String name;
    private Integer age;
    private List<String> favoriteGenres;
    private LocalDateTime likedAt;
}
