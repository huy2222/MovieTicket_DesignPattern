package org.example.backend.service;

import org.example.backend.dto.response.CustomerResponse;
import org.example.backend.dto.response.CustomerResponseAdmin;
import org.example.backend.dto.response.LocationResponse;
import org.example.backend.dto.response.ProfileCardResponse;
import org.example.backend.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {
    private final CustomerRepository customerRepository;
    public  CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }
    public CustomerResponse getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email)
                .map(customer -> CustomerResponse.builder()
                        .id(customer.getId())
                        .profileCard(customer.getProfileCard() != null ?
                            ProfileCardResponse.builder()
                                .id(customer.getProfileCard().getId())
                                .age(customer.getProfileCard().getAge())
                                .displayName(customer.getProfileCard().getDisplayName())
                                .build() : null)
                        .currentLocation(customer.getCurrentLocation() != null ?
                            LocationResponse.builder()
                                .id(customer.getCurrentLocation().getId())
                                    .address(customer.getCurrentLocation().getAddress())
                                    .ward(customer.getCurrentLocation().getWard())
                                    .district(customer.getCurrentLocation().getDistrict())
                                    .city(customer.getCurrentLocation().getCity())
                                    .country(customer.getCurrentLocation().getCountry())
                                    .build() : null)
                        .build())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }
    public CustomerResponseAdmin getCustomerByIdForAdmin(Long id) {
        return customerRepository.findById(id)
                .map(customer -> CustomerResponseAdmin.builder()
                        .id(customer.getId())
                        .email(customer.getEmail())
                        .fullName(customer.getProfileCard() != null ? customer.getProfileCard().getDisplayName() : null)
                        .status(customer.getStatus() != null ? customer.getStatus().name() : null)
                        .createdAt(customer.getCreatedAt() != null ? customer.getCreatedAt().toString() : null)
                        .build())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }
    public List<CustomerResponseAdmin> getAllCustomersForAdmin() {
        return customerRepository.findAll().stream()
                .map(customer -> CustomerResponseAdmin.builder()
                        .id(customer.getId())
                        .email(customer.getEmail())
                        .fullName(customer.getProfileCard() != null ? customer.getProfileCard().getDisplayName() : null)
                        .status(customer.getStatus() != null ? customer.getStatus().name() : null)
                        .createdAt(customer.getCreatedAt() != null ? customer.getCreatedAt().toString() : null)
                        .build())
                .toList();
    }

}
