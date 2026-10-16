package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CineMeetPeerResponse {
    private Long customerId;
    private String avatar;
    private String name;
    private Integer age;
}
