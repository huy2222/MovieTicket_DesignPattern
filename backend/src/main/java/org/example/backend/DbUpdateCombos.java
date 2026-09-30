package org.example.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DbUpdateCombos implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DbUpdateCombos(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("=== UPDATING COMBO IMAGES ===");
            jdbcTemplate.execute("UPDATE combos SET image_url = 'https://s3img.vcdn.vn/123phim/2021/02/bap-nuoc-1-16135544716186.png' WHERE name LIKE '%1 Bắp 1 Nước%'");
            jdbcTemplate.execute("UPDATE combos SET image_url = 'https://s3img.vcdn.vn/123phim/2021/02/bap-nuoc-2-16135544716762.png' WHERE name LIKE '%1 Bắp 2 Nước%'");
            jdbcTemplate.execute("UPDATE combos SET image_url = 'https://s3img.vcdn.vn/123phim/2021/02/bap-nuoc-3-16135544720199.png' WHERE name LIKE '%Gia Đình%'");
            System.out.println("-> Updated Combo image_url successfully.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
