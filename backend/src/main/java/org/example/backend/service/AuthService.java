package org.example.backend.service;

import org.example.backend.dto.request.LoginRequest;
import org.example.backend.dto.request.RegisterRequest;
import org.example.backend.dto.response.AuthResponse;
import org.example.backend.dto.response.UserResponse;
import org.example.backend.entity.Customer;
import org.example.backend.entity.ProfileCard;
import org.example.backend.entity.User;
import org.example.backend.enums.AccountStatus;
import org.example.backend.enums.Role;
import org.example.backend.repository.UserRepository;
import org.example.backend.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // REGISTER
    public UserResponse register(RegisterRequest req) {

        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        // Chuẩn hóa và kiểm tra định dạng số điện thoại
        String phone = req.getPhoneNumber();
        if (phone != null) {
            phone = phone.trim();
            if (phone.startsWith("+84")) {
                phone = "0" + phone.substring(3);
            } else if (phone.startsWith("84") && phone.length() > 9) {
                phone = "0" + phone.substring(2);
            }
            phone = phone.replaceAll("\\D", "");
        }

        if (phone == null || !phone.matches("^0[0-9]{9}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số điện thoại không đúng định dạng (phải gồm 10 chữ số bắt đầu bằng số 0)");
        }

        Customer user = new Customer(); // vì User là abstract
        user.setEmail(req.getEmail());
        user.setFullName(req.getFullName());
        user.setPhoneNumber(phone);

        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));

        user.setRole(Role.CUSTOMER);
        user.setStatus(AccountStatus.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());

        ProfileCard profile = new ProfileCard();
        profile.setDisplayName(req.getFullName());
        profile.setAge(0);
        profile.setCineMeetEnabled(false);
        profile.setVisibleToCustomer(false);
        profile.setOwnerCustomer(user);
        user.setProfileCard(profile);

        userRepository.save(user);
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .build();
    }

    // LOGIN
    public AuthResponse login(LoginRequest req) {

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
        }

        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();


    }
}
