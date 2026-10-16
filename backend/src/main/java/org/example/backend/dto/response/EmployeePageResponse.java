package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class EmployeePageResponse {
    private List<EmployeeResponse> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
