package org.example.backend.config;

import org.example.backend.entity.Admin;
import org.example.backend.enums.AccountStatus;
import org.example.backend.enums.Role;
import org.example.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@admin.com";
        
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            Admin admin = new Admin();
            admin.setEmail(adminEmail);
            admin.setFullName("System Administrator");
            admin.setPasswordHash(passwordEncoder.encode("admin"));
            admin.setPhoneNumber("0000000000");
            admin.setRole(Role.ADMIN);
            admin.setStatus(AccountStatus.ACTIVE);
            admin.setCreatedAt(LocalDateTime.now());
            
            userRepository.save(admin);
            System.out.println("============================================");
            System.out.println("Admin account created successfully!");
            System.out.println("Email: admin@admin.com");
            System.out.println("Password: admin");
            System.out.println("============================================");
        } else {
            System.out.println("Admin account already exists.");
        }
    }
}
