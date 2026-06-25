package org.example.backend.dto.request;

import lombok.Data;

@Data
public class UpdateLocationRequest {
    private Double latitude;
    private Double longitude;
    private String address;
    private String ward;
    private String district;
    private String city;
    private String country;
}
