package org.example.backend.dto.request;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String fullName;
    private String password;
    private String phoneNumber;
}
