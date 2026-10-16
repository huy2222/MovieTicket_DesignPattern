package org.example.backend.repository;

import org.example.backend.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    long countByRole(org.example.backend.enums.Role role);

    @Query("SELECT COUNT(s) FROM Staff s")
    long countAllStaff();
}
