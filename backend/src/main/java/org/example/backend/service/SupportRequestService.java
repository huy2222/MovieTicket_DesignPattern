package org.example.backend.service;

import org.example.backend.dto.request.SupportRequestRequest;
import org.example.backend.entity.SupportRequest;
import org.example.backend.entity.User;
import org.example.backend.repository.SupportRequestRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SupportRequestService {

    private final SupportRequestRepository supportRequestRepository;
    private final UserRepository userRepository;

    public SupportRequestService(
            SupportRequestRepository supportRequestRepository,
            UserRepository userRepository) {

        this.supportRequestRepository = supportRequestRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public SupportRequest create(
            String email,
            SupportRequestRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy tài khoản"));

        SupportRequest supportRequest = new SupportRequest();

        supportRequest.setUser(user);
        supportRequest.setTitle(request.getTitle().trim());
        supportRequest.setContent(request.getContent().trim());
        supportRequest.setIssueType(request.getIssueType().trim());

        supportRequest.setStatus("Chờ xử lý");

        return supportRequestRepository.save(supportRequest);
    }

    public List<SupportRequest> getMyRequests(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy tài khoản"));

        return supportRequestRepository
                .findByUserOrderByCreatedAtDesc(user);
    }
}