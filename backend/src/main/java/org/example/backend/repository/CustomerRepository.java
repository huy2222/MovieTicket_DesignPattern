package org.example.backend.repository;

import org.example.backend.dto.response.CustomerResponseAdmin;
import org.example.backend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);
    List<Customer> findAll();
    @Query("""
        SELECT new org.example.backend.dto.response.CustomerResponseAdmin(
            c.id,
            c.email,
            c.fullName,
            c.status,
            c.createdAt
        )
        FROM Customer c
        """)
    List<CustomerResponseAdmin> getCustomersForAdmin();
}
