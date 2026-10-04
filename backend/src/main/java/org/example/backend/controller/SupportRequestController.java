package org.example.backend.controller;

import jakarta.validation.Valid;
import org.example.backend.dto.request.SupportRequestRequest;
import org.example.backend.entity.SupportRequest;
import org.example.backend.service.SupportRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support")
@CrossOrigin
public class SupportRequestController {

    private final SupportRequestService supportRequestService;

    public SupportRequestController(
            SupportRequestService supportRequestService) {

        this.supportRequestService = supportRequestService;
    }

    @PostMapping
    public ResponseEntity<?> createSupportRequest(
            @Valid @RequestBody SupportRequestRequest request,
            Authentication authentication) {

        try {

            if (authentication == null ||
                    !authentication.isAuthenticated()) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of(
                                "message",
                                "Vui lòng đăng nhập để gửi yêu cầu hỗ trợ"
                        ));
            }

            String email = authentication.getName();

            SupportRequest saved =
                    supportRequestService.create(email, request);

            Map<String, Object> response = new HashMap<>();

            response.put("success", true);
            response.put(
                    "message",
                    "Gửi yêu cầu hỗ trợ thành công"
            );

            response.put("id", saved.getId());
            response.put("status", saved.getStatus());

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message",
                            "Gửi yêu cầu hỗ trợ thất bại. Vui lòng thử lại sau."
                    ));
        }
    }

    @GetMapping("/my-requests")
    public ResponseEntity<?> getMyRequests(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Vui lòng đăng nhập"
                    ));
        }

        String email = authentication.getName();

        List<SupportRequest> requests =
                supportRequestService.getMyRequests(email);

        return ResponseEntity.ok(requests);
    }
}