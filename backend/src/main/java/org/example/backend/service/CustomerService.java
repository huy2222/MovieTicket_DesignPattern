package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.response.CustomerResponse;
import org.example.backend.dto.response.CustomerResponseAdmin;
import org.example.backend.dto.response.CustomerDetailResponse;
import org.example.backend.dto.response.LocationResponse;
import org.example.backend.dto.response.ProfileCardResponse;
import org.example.backend.entity.Customer;
import org.example.backend.entity.Location;
import org.example.backend.entity.ProfileCard;
import org.example.backend.enums.AccountStatus;
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
                        .fullName(customer.getFullName())
                        .profileCard(customer.getProfileCard() != null ?
                            ProfileCardResponse.builder()
                                .id(customer.getProfileCard().getId())
                                .age(customer.getProfileCard().getAge())
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
                        customer.setFullName(updatedProfile.getFullName() != null ? updatedProfile.getFullName() : customer.getFullName());
                        customer.getProfileCard().setAge(updatedProfile.getProfileCard().getAge() != null
                                ? updatedProfile.getProfileCard().getAge() : 0);
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
                            .fullName(customer.getFullName())
                            .profileCard(customer.getProfileCard() != null ?
                                    ProfileCardResponse.builder()
                                            .id(customer.getProfileCard().getId())
                                            .age(customer.getProfileCard().getAge())
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

    public List<CustomerResponseAdmin> getAllCustomersForAdmin() {
        return customerRepository.getCustomersForAdmin();
    }

    public void BlockCustomerAccount(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        customer.setStatus(AccountStatus.LOCKED);
        customerRepository.save(customer);
    }
    public void UnBlockCustomerAccount(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        customer.setStatus(AccountStatus.ACTIVE);
        customerRepository.save(customer);
    }

    public CustomerDetailResponse getCustomerDetail(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        Integer age = null;
        String bio = null;
        String avatar = null;
        
        if (customer.getProfileCard() != null) {
            age = customer.getProfileCard().getAge();
            bio = customer.getProfileCard().getBio();
            avatar = customer.getProfileCard().getAvatarUrl();
        }
        
        if (avatar == null || avatar.isEmpty()) {
            avatar = customer.getAvatarUrl();
        }

        return CustomerDetailResponse.builder()
                .id(customer.getId())
                .email(customer.getEmail())
                .fullName(customer.getFullName())
                .age(age)
                .bio(bio)
                .loyaltyPoints(customer.getLoyaltyPoints())
                .status(customer.getStatus())
                .createdAt(customer.getCreatedAt())
                .avatar(avatar)
                .build();
    }

    public CustomerResponse updateAvatar(String email, MultipartFile avatar) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        String avatarUrl = cloudinaryService.upload(avatar);
        if (customer.getProfileCard() == null) {
            customer.setProfileCard(new ProfileCard());
        }
        customer.setFullName(customer.getFullName()); // Keep the existing full name
        customer.getProfileCard().setAvatarUrl(avatarUrl);
        customerRepository.save(customer);
        return CustomerResponse.builder()
                .id(customer.getId())
                .fullName(customer.getFullName())
                .profileCard(customer.getProfileCard() != null ?
                        ProfileCardResponse.builder()
                                .id(customer.getProfileCard().getId())
                                .age(customer.getProfileCard().getAge())
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
