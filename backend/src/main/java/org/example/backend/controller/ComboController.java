package org.example.backend.controller;

import org.example.backend.entity.Combo;
import org.example.backend.repository.ComboRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/combos")
public class ComboController {

    private final ComboRepository comboRepository;

    public ComboController(ComboRepository comboRepository) {
        this.comboRepository = comboRepository;
    }

    @GetMapping
    public ResponseEntity<List<Combo>> getActiveCombos() {
        return ResponseEntity.ok(comboRepository.findByActiveTrue());
    }
}
