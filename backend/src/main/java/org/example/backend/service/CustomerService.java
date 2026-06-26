package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.response.CustomerResponse;
import org.example.backend.dto.response.CustomerResponseAdmin;
import org.example.backend.dto.response.LocationResponse;
import org.example.backend.dto.response.ProfileCardResponse;
import org.example.backend.entity.Customer;
import org.example.backend.entity.Location;
import org.example.backend.entity.ProfileCard;
import org.example.backend.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final CloudinaryService cloudinaryService;
    public CustomerResponse getCustomerByEmail(String email) {
        return customerRepository.findByEmail(email)
                .map(customer -> CustomerResponse.builder()
                        .id(customer.getId())
                        .profileCard(customer.getProfileCard() != null ?
                            ProfileCardResponse.builder()
                                .id(customer.getProfileCard().getId())
                                .age(customer.getProfileCard().getAge())
                                .displayName(customer.getProfileCard().getDisplayName())
                                .bio(customer.getProfileCard().getBio())
                                .cineMeetEnabled(customer.getProfileCard().isCineMeetEnabled())
                                .avatarUrl(customer.getProfileCard().getAvatarUrl())
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

    public CustomerResponse updateCustomerProfile(String email, CustomerResponse updatedProfile) {
        return customerRepository.findByEmail(email)
                .map(customer -> {
                    if (updatedProfile.getProfileCard() != null) {
                        if (customer.getProfileCard() == null) {
                            customer.setProfileCard(new ProfileCard());
                        }
                        customer.getProfileCard().setAge(updatedProfile.getProfileCard().getAge() != null
                                ? updatedProfile.getProfileCard().getAge() : 0);
                        customer.getProfileCard().setDisplayName(updatedProfile.getProfileCard().getDisplayName());
                        if (updatedProfile.getProfileCard().getBio() != null) {
                            customer.getProfileCard().setBio(updatedProfile.getProfileCard().getBio());
                        }
                        if (updatedProfile.getProfileCard().getCineMeetEnabled() != null) {
                            boolean enabled = updatedProfile.getProfileCard().getCineMeetEnabled();
                            customer.getProfileCard().setCineMeetEnabled(enabled);
                            customer.getProfileCard().setVisibleToCustomer(enabled);
                        }
                    }
                    if (updatedProfile.getCurrentLocation() != null) {
                        if (customer.getCurrentLocation() == null) {
                            customer.setCurrentLocation(new Location());
                        }
                        customer.getCurrentLocation().setAddress(updatedProfile.getCurrentLocation().getAddress());
                        customer.getCurrentLocation().setWard(updatedProfile.getCurrentLocation().getWard());
                        customer.getCurrentLocation().setDistrict(updatedProfile.getCurrentLocation().getDistrict());
                        customer.getCurrentLocation().setCity(updatedProfile.getCurrentLocation().getCity());
                        customer.getCurrentLocation().setCountry(updatedProfile.getCurrentLocation().getCountry());
                    }
                    customerRepository.save(customer);
                    return CustomerResponse.builder()
                            .id(customer.getId())
                            .profileCard(customer.getProfileCard() != null ?
                                    ProfileCardResponse.builder()
                                            .id(customer.getProfileCard().getId())
                                            .age(customer.getProfileCard().getAge())
                                            .displayName(customer.getProfileCard().getDisplayName())
                                            .bio(customer.getProfileCard().getBio())
                                            .cineMeetEnabled(customer.getProfileCard().isCineMeetEnabled())
                                            .avatarUrl(customer.getProfileCard().getAvatarUrl())
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
                            .build();
                })
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

    public CustomerResponse updateAvatar(String email, MultipartFile avatar) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        String avatarUrl = cloudinaryService.upload(avatar);
        if (customer.getProfileCard() == null) {
            customer.setProfileCard(new ProfileCard());
        }
        customer.getProfileCard().setAvatarUrl(avatarUrl);
        customerRepository.save(customer);
        return CustomerResponse.builder()
                .id(customer.getId())
                .profileCard(customer.getProfileCard() != null ?
                        ProfileCardResponse.builder()
                                .id(customer.getProfileCard().getId())
                                .age(customer.getProfileCard().getAge())
                                .displayName(customer.getProfileCard().getDisplayName())
                                .bio(customer.getProfileCard().getBio())
                                .cineMeetEnabled(customer.getProfileCard().isCineMeetEnabled())
                                .avatarUrl(customer.getProfileCard().getAvatarUrl())
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
                .build();
    }
}
