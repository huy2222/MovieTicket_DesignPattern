package org.example.backend.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerResponseAdmin {
    private Long id;
    private String email;
    private String fullName;
    private String status;
    private String createdAt;
}
