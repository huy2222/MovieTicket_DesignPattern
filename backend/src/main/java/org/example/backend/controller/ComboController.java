package org.example.backend.controller;

import jakarta.validation.Valid;
import org.example.backend.dto.request.ComboRequest;
import org.example.backend.dto.response.ComboResponse;
import org.example.backend.service.ComboService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/combos")
public class ComboController {

    private final ComboService comboService;

    public ComboController(ComboService comboService) {
        this.comboService = comboService;
    }

    @GetMapping
    public ResponseEntity<List<ComboResponse>> getAllCombos() {
        return ResponseEntity.ok(comboService.getAllCombos());
    }

    @GetMapping("/active")
    public ResponseEntity<List<ComboResponse>> getActiveCombos() {
        return ResponseEntity.ok(comboService.getActiveCombos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComboResponse> getComboById(@PathVariable Long id) {
        return ResponseEntity.ok(comboService.getComboById(id));
    }

    @PostMapping
    public ResponseEntity<ComboResponse> createCombo(@Valid @RequestBody ComboRequest request) {
        return ResponseEntity.ok(comboService.createCombo(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ComboResponse> updateCombo(@PathVariable Long id, @Valid @RequestBody ComboRequest request) {
        return ResponseEntity.ok(comboService.updateCombo(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ComboResponse> changeStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Boolean status = body.get("isActive");
        return ResponseEntity.ok(comboService.changeStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCombo(@PathVariable Long id) {
        comboService.deleteCombo(id);
        return ResponseEntity.noContent().build();
    }
}
