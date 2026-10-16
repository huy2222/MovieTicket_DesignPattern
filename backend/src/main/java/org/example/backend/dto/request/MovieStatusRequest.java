package org.example.backend.dto.request;

import lombok.Data;
import org.example.backend.enums.MovieStatus;

@Data
public class MovieStatusRequest {
    private MovieStatus status;
}
