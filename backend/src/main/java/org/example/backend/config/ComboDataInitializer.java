package org.example.backend.config;

import org.example.backend.entity.Combo;
import org.example.backend.entity.Staff;
import org.example.backend.enums.AccountStatus;
import org.example.backend.enums.Role;
import org.example.backend.repository.ComboRepository;
import org.example.backend.repository.StaffRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class ComboDataInitializer implements CommandLineRunner {

    private final ComboRepository comboRepository;
    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    public ComboDataInitializer(ComboRepository comboRepository,
                                UserRepository userRepository,
                                StaffRepository staffRepository,
                                PasswordEncoder passwordEncoder) {
        this.comboRepository = comboRepository;
        this.userRepository = userRepository;
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Initialize sample combos if empty
        if (comboRepository.count() == 0) {
            Combo combo1 = Combo.builder()
                    .name("Combo Solo")
                    .description("1 Bắp Rang Bơ Phô Mai/Ngọt + 1 Nước Ngọt 500ml")
                    .price(79000.0)
                    .imageUrl("https://images.unsplash.com/photo-1585647347384-2593bc35786b?w=400")
                    .active(true)
                    .build();

            Combo combo2 = Combo.builder()
                    .name("Combo Couple")
                    .description("1 Bắp Rang Bơ Lớn + 2 Nước Ngọt 500ml")
                    .price(119000.0)
                    .imageUrl("https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400")
                    .active(true)
                    .build();

            Combo combo3 = Combo.builder()
                    .name("Combo Family")
                    .description("2 Bắp Rang Bơ Lớn + 4 Nước Ngọt 500ml + 1 Snack")
                    .price(199000.0)
                    .imageUrl("https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400")
                    .active(true)
                    .build();

            comboRepository.saveAll(List.of(combo1, combo2, combo3));
            System.out.println("Default Combos created successfully!");
        }

        // Initialize sample staff account if not exists
        String staffEmail = "staff@cinemax.com";
        if (userRepository.findByEmail(staffEmail).isEmpty()) {
            Staff staff = new Staff();
            staff.setEmail(staffEmail);
            staff.setFullName("Nhân Viên Rạp CINEMAX");
            staff.setPasswordHash(passwordEncoder.encode("staff123"));
            staff.setPhoneNumber("0987654321");
            staff.setRole(Role.STAFF);
            staff.setStatus(AccountStatus.ACTIVE);
            staff.setCreatedAt(LocalDateTime.now());
            staff.setPosition("Staff Phục Vụ Combo");

            staffRepository.save(staff);
            System.out.println("Sample Staff account created! Email: " + staffEmail + " / Password: staff123");
        }
    }
}
