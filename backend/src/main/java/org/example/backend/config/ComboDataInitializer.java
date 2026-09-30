package org.example.backend.config;

import org.example.backend.entity.Combo;
import org.example.backend.repository.ComboRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ComboDataInitializer implements CommandLineRunner {

    private final ComboRepository comboRepository;

    public ComboDataInitializer(ComboRepository comboRepository) {
        this.comboRepository = comboRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (comboRepository.count() == 0) {
            System.out.println("Seeding initial Combos...");

            Combo combo1 = Combo.builder()
                    .name("Combo 1 Bắp 1 Nước")
                    .description("1 Bắp lớn + 1 Nước ngọt lớn")
                    .price(85000.0)
                    .imageUrl("https://s3img.vcdn.vn/123phim/2021/02/bap-nuoc-1-16135544716186.png")
                    .isActive(true)
                    .build();

            Combo combo2 = Combo.builder()
                    .name("Combo 1 Bắp 2 Nước")
                    .description("1 Bắp lớn + 2 Nước ngọt lớn")
                    .price(105000.0)
                    .imageUrl("https://s3img.vcdn.vn/123phim/2021/02/bap-nuoc-2-16135544716762.png")
                    .isActive(true)
                    .build();

            Combo combo3 = Combo.builder()
                    .name("Combo Gia Đình")
                    .description("2 Bắp lớn + 4 Nước ngọt lớn")
                    .price(180000.0)
                    .imageUrl("https://s3img.vcdn.vn/123phim/2021/02/bap-nuoc-3-16135544720199.png")
                    .isActive(true)
                    .build();

            comboRepository.saveAll(List.of(combo1, combo2, combo3));
            System.out.println("Seeded 3 Combos successfully.");
        } else {
            System.out.println("Combos already seeded.");
        }
    }
}
