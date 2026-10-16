package org.example.backend.dto.request;

import lombok.Data;

@Data
public class MovieDateRequest {
    private Long movieId;
    private Long showtimeId;
}
