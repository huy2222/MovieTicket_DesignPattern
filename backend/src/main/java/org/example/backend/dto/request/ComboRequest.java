package org.example.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ComboRequest {
    @NotBlank(message = "Tên combo không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Giá combo không được để trống")
    @Min(value = 0, message = "Giá combo phải lớn hơn hoặc bằng 0")
    private Double price;

    private String imageUrl;

    private Boolean isActive;
}
