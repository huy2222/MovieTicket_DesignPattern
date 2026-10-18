package org.example.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.example.backend.entity.Customer;
import org.example.backend.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private static final String SECRET_KEY = "1234567891234567891234567891234567891234567891234567891234567891";
    private static final long EXPIRATION = 3600000; // 1 hour

    private JwtService jwtService;

    @BeforeEach
    void setUp() throws Exception {
        jwtService = new JwtService();

        Field secretKeyField = JwtService.class.getDeclaredField("secretKey");
        secretKeyField.setAccessible(true);
        secretKeyField.set(jwtService, SECRET_KEY);

        Field expirationField = JwtService.class.getDeclaredField("expiration");
        expirationField.setAccessible(true);
        expirationField.set(jwtService, EXPIRATION);
    }

    @Test
    @DisplayName("TC-JWT-01: Tạo JWT token thành công và trích xuất đúng Email subject")
    void testGenerateToken_ExtractEmail() {
        Customer customer = new Customer();
        customer.setEmail("customer@cinema.com");
        customer.setRole(Role.CUSTOMER);

        String token = jwtService.generateToken(customer);

        assertNotNull(token);
        assertFalse(token.isEmpty());

        String extractedEmail = jwtService.extractEmail(token);
        assertEquals("customer@cinema.com", extractedEmail);
    }

    @Test
    @DisplayName("TC-JWT-02: Trích xuất đúng Role từ Claim trong JWT token")
    void testGenerateToken_ExtractRole() {
        Customer admin = new Customer();
        admin.setEmail("admin@cinema.com");
        admin.setRole(Role.ADMIN);

        String token = jwtService.generateToken(admin);

        String extractedRole = jwtService.extractRole(token);
        assertEquals("ADMIN", extractedRole);
    }

    @Test
    @DisplayName("TC-JWT-03: Kiểm tra tính hợp lệ của token vừa tạo (isValid = true)")
    void testIsValid_ValidToken() {
        Customer customer = new Customer();
        customer.setEmail("customer@cinema.com");
        customer.setRole(Role.CUSTOMER);

        String token = jwtService.generateToken(customer);

        assertTrue(jwtService.isValid(token));
    }

    @Test
    @DisplayName("TC-JWT-04: Token bị lỗi định dạng (malformed) -> isValid = false")
    void testIsValid_MalformedToken() {
        assertFalse(jwtService.isValid("invalid.token.string"));
        assertFalse(jwtService.isValid(""));
        assertFalse(jwtService.isValid(null));
    }

    @Test
    @DisplayName("TC-JWT-05: Token ký bởi Secret Key khác (giả mạo) -> isValid = false")
    void testIsValid_DifferentSecretKey() {
        SecretKey otherKey = Keys.hmacShaKeyFor(
                "different_secret_key_98765432101234567890123456789012".getBytes(StandardCharsets.UTF_8)
        );
        String forgedToken = Jwts.builder()
                .subject("hacker@cinema.com")
                .claim("role", "ADMIN")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 60000))
                .signWith(otherKey)
                .compact();

        assertFalse(jwtService.isValid(forgedToken));
    }

    @Test
    @DisplayName("TC-JWT-06: Token đã hết hạn (expired) -> isValid = false")
    void testIsValid_ExpiredToken() throws Exception {
        // Tạo token với thời gian hết hạn trong quá khứ
        SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
        String expiredToken = Jwts.builder()
                .subject("expired@cinema.com")
                .claim("role", "CUSTOMER")
                .issuedAt(new Date(System.currentTimeMillis() - 10000))
                .expiration(new Date(System.currentTimeMillis() - 1000)) // đã hết hạn
                .signWith(key)
                .compact();

        assertFalse(jwtService.isValid(expiredToken));
    }
}
