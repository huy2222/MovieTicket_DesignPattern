package org.example.backend.config;

import lombok.RequiredArgsConstructor;
import org.example.backend.entity.Admin;
import org.example.backend.enums.AccountStatus;
import org.example.backend.enums.Role;
import org.example.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class AdminAccountInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String email = System.getenv("ADMIN_EMAIL");
        String password = System.getenv("ADMIN_PASSWORD");
        String fullName = System.getenv().getOrDefault("ADMIN_FULL_NAME", "Cinema Admin");

        if (isBlank(email) || isBlank(password) || userRepository.findByEmail(email).isPresent()) {
            return;
        }

        Admin admin = new Admin();
        admin.setEmail(email.trim());
        admin.setFullName(fullName.trim());
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setRole(Role.ADMIN);
        admin.setStatus(AccountStatus.ACTIVE);
        admin.setCreatedAt(LocalDateTime.now());

        userRepository.save(admin);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
