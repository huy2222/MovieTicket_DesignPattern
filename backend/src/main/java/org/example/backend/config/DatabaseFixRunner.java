package org.example.backend.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseFixRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixEnumColumns() {
        try {
            jdbcTemplate.execute("ALTER TABLE bookings MODIFY status VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE tickets MODIFY status VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE payments MODIFY status VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE movies MODIFY status VARCHAR(255)");
            System.out.println("✅ Đã tự động sửa kiểu dữ liệu các cột status thành VARCHAR(255) trong Database!");
        } catch (Exception e) {
            System.err.println("⚠️ Thông báo Database Fix Runner: " + e.getMessage());
        }
    }
}
