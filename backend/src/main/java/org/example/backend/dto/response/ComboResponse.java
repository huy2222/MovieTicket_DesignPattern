package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ComboResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private Boolean isActive;
}
