package org.example.backend.service;

import org.example.backend.dto.request.ComboRequest;
import org.example.backend.dto.response.ComboResponse;
import org.example.backend.entity.Combo;
import org.example.backend.repository.ComboRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComboService {
    private final ComboRepository comboRepository;

    public ComboService(ComboRepository comboRepository) {
        this.comboRepository = comboRepository;
    }

    public List<ComboResponse> getAllCombos() {
        List<Combo> combos = comboRepository.findAll();
        if (combos.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không có dữ liệu combo");
        }
        return combos.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ComboResponse> getActiveCombos() {
        List<Combo> combos = comboRepository.findByIsActiveTrue();
        return combos.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ComboResponse getComboById(Long id) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy combo"));
        return mapToResponse(combo);
    }

    public ComboResponse createCombo(ComboRequest request) {
        Combo combo = Combo.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
        
        try {
            Combo savedCombo = comboRepository.save(combo);
            return mapToResponse(savedCombo);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cập nhật thông tin combo thất bại. Vui lòng thử lại sau.");
        }
    }

    public ComboResponse updateCombo(Long id, ComboRequest request) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy combo"));
        
        combo.setName(request.getName());
        combo.setDescription(request.getDescription());
        combo.setPrice(request.getPrice());
        combo.setImageUrl(request.getImageUrl());
        if (request.getIsActive() != null) {
            combo.setIsActive(request.getIsActive());
        }

        try {
            Combo updatedCombo = comboRepository.save(combo);
            return mapToResponse(updatedCombo);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cập nhật thông tin combo thất bại. Vui lòng thử lại sau.");
        }
    }

    public ComboResponse changeStatus(Long id, boolean status) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy combo"));
        
        combo.setIsActive(status);
        try {
            Combo updatedCombo = comboRepository.save(combo);
            return mapToResponse(updatedCombo);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cập nhật thông tin combo thất bại. Vui lòng thử lại sau.");
        }
    }

    public void deleteCombo(Long id) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy combo"));
        try {
            comboRepository.delete(combo);
        } catch (Exception e) {
            // Thay vì xóa cứng, nếu đã có dữ liệu giao dịch thì chỉ chuyển trạng thái (Soft disable)
            combo.setIsActive(false);
            comboRepository.save(combo);
        }
    }

    private ComboResponse mapToResponse(Combo combo) {
        return ComboResponse.builder()
                .id(combo.getId())
                .name(combo.getName())
                .description(combo.getDescription())
                .price(combo.getPrice())
                .imageUrl(combo.getImageUrl())
                .isActive(combo.getIsActive())
                .build();
    }
}
