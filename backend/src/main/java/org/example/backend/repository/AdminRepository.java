package org.example.backend.repository;

import org.example.backend.entity.Admin;
import org.example.backend.enums.AccountStatus;
import org.example.backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByEmail(String email);

    long countByRole(Role role);

    @Query("SELECT COUNT(a) FROM Admin a WHERE a.status = :status")
    long countByStatus(AccountStatus status);
}
