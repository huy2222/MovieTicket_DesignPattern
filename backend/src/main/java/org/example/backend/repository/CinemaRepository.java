package org.example.backend.repository;

import org.example.backend.entity.Cinema;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CinemaRepository extends JpaRepository<Cinema, Long> {
    Optional<Cinema> findByNameIgnoreCase(String name);
}
