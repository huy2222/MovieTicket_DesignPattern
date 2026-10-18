package org.example.backend.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

class SecurityConfigTest {

    private final SecurityConfig securityConfig = new SecurityConfig(null, null);

    @Test
    @DisplayName("TC-SEC-01: BCrypt PasswordEncoder mã hóa một chiều và xác thực chính xác")
    void testPasswordEncoder_EncodesAndMatchesCorrectly() {
        PasswordEncoder encoder = securityConfig.passwordEncoder();
        assertNotNull(encoder);

        String rawPassword = "StrongPassword@2026";
        String encodedHash1 = encoder.encode(rawPassword);
        String encodedHash2 = encoder.encode(rawPassword);

        // BCrypt sử dụng salt ngẫu nhiên nên 2 lần mã hóa cùng một mật khẩu sẽ cho ra 2 chuỗi hash khác nhau
        assertNotEquals(rawPassword, encodedHash1);
        assertNotEquals(encodedHash1, encodedHash2);

        // Nhưng đều phải match với mật khẩu gốc
        assertTrue(encoder.matches(rawPassword, encodedHash1));
        assertTrue(encoder.matches(rawPassword, encodedHash2));

        // Mật khẩu sai phải trả về false
        assertFalse(encoder.matches("WrongPassword@2026", encodedHash1));
    }
}
