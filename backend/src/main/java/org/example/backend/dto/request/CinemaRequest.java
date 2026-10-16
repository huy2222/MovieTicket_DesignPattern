package org.example.backend.dto.request;

import lombok.Data;
import org.example.backend.enums.CinemaStatus;

@Data
public class CinemaRequest {
    private String name;
    private String phoneNumber;
    private String area;
    private String address;
    private CinemaStatus status;
}
