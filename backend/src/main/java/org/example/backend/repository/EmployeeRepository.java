package org.example.backend.repository;

import org.example.backend.enums.AccountStatus;
import org.example.backend.enums.Role;
import org.example.backend.repository.projection.EmployeeProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.example.backend.entity.User;
import org.example.backend.entity.Staff;

import java.util.Collection;

public interface EmployeeRepository extends JpaRepository<User, Long> {

    @Query("""
            SELECT u.id AS id,
                   u.email AS email,
                   u.fullName AS fullName,
                   u.avatarUrl AS avatarUrl,
                   u.phoneNumber AS phoneNumber,
                   u.role AS role,
                   u.status AS status,
                   u.createdAt AS createdAt,
                   s.position AS position,
                   c.id AS cinemaId,
                   c.name AS cinemaName
            FROM User u
            LEFT JOIN Staff s ON s.id = u.id
            LEFT JOIN s.workingCinema c
            WHERE u.role IN :roles
              AND (:search IS NULL OR :search = ''
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:fullName IS NULL OR :fullName = ''
                   OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :fullName, '%')))
              AND (:email IS NULL OR :email = ''
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%')))
              AND (:phoneNumber IS NULL OR :phoneNumber = ''
                   OR LOWER(u.phoneNumber) LIKE LOWER(CONCAT('%', :phoneNumber, '%')))
              AND (:role IS NULL OR u.role = :role)
              AND (:status IS NULL OR u.status = :status)
            """)
    Page<EmployeeProjection> searchEmployees(
            @Param("roles") Collection<Role> roles,
            @Param("search") String search,
            @Param("fullName") String fullName,
            @Param("email") String email,
            @Param("phoneNumber") String phoneNumber,
            @Param("role") Role role,
            @Param("status") AccountStatus status,
            Pageable pageable
    );
}
