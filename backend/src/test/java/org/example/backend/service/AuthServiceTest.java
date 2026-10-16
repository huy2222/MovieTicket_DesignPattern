package org.example.backend.service;

import org.example.backend.dto.request.LoginRequest;
import org.example.backend.dto.request.RegisterRequest;
import org.example.backend.dto.response.AuthResponse;
import org.example.backend.dto.response.UserResponse;
import org.example.backend.entity.Customer;
import org.example.backend.entity.User;
import org.example.backend.enums.AccountStatus;
import org.example.backend.enums.Role;
import org.example.backend.repository.UserRepository;
import org.example.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtService);
    }

    // ==========================================
    // 1. REGISTER TESTS
    // ==========================================

    @Test
    @DisplayName("TC-AUTH-01: Đăng ký tài khoản thành công với thông tin hợp lệ")
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("user.test@example.com");
        request.setFullName("Nguyen Van Test");
        request.setPhoneNumber("0987654321");
        request.setPassword("Password123@");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded_password_hash");
        when(userRepository.save(any(Customer.class))).thenAnswer(invocation -> {
            Customer c = invocation.getArgument(0);
            c.setId(100L);
            return c;
        });

        UserResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("user.test@example.com", response.getEmail());
        assertEquals("Nguyen Van Test", response.getFullName());
        assertEquals("CUSTOMER", response.getRole());
        assertEquals("ACTIVE", response.getStatus());

        ArgumentCaptor<Customer> customerCaptor = ArgumentCaptor.forClass(Customer.class);
        verify(userRepository).save(customerCaptor.capture());
        Customer savedCustomer = customerCaptor.getValue();

        assertEquals("user.test@example.com", savedCustomer.getEmail());
        assertEquals("encoded_password_hash", savedCustomer.getPasswordHash());
        assertEquals(Role.CUSTOMER, savedCustomer.getRole());
        assertEquals(AccountStatus.ACTIVE, savedCustomer.getStatus());
        assertNotNull(savedCustomer.getProfileCard(), "ProfileCard phải được khởi tạo tự động");
        assertEquals("Nguyen Van Test", savedCustomer.getProfileCard().getDisplayName());
        assertEquals(0, savedCustomer.getProfileCard().getAge());
        assertFalse(savedCustomer.getProfileCard().isCineMeetEnabled());
    }

    @Test
    @DisplayName("TC-AUTH-02: Đăng ký thất bại khi email đã tồn tại trong hệ thống")
    void testRegister_DuplicateEmail_ThrowsException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@example.com");
        request.setFullName("Nguyen Van A");
        request.setPassword("Secret123!");

        Customer existingUser = new Customer();
        existingUser.setEmail("existing@example.com");
        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(existingUser));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.register(request));
        assertEquals("Email already exists", exception.getMessage());

        verify(userRepository, never()).save(any());
    }

    // ==========================================
    // 2. LOGIN TESTS
    // ==========================================

    @Test
    @DisplayName("TC-AUTH-03: Đăng nhập thành công với email và mật khẩu chính xác")
    void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("customer@example.com");
        request.setPassword("CorrectPassword123");

        Customer user = new Customer();
        user.setId(1L);
        user.setEmail("customer@example.com");
        user.setFullName("Customer One");
        user.setPasswordHash("hashed_correct_pw");
        user.setRole(Role.CUSTOMER);
        user.setStatus(AccountStatus.ACTIVE);

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("CorrectPassword123", "hashed_correct_pw")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("mocked.jwt.token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals(1L, response.getId());
        assertEquals("customer@example.com", response.getEmail());
        assertEquals("Customer One", response.getFullName());
        assertEquals(Role.CUSTOMER, response.getRole());
    }

    @Test
    @DisplayName("TC-AUTH-04: Đăng nhập thất bại khi email không tồn tại trong DB")
    void testLogin_UserNotFound_ThrowsUnauthorized() {
        LoginRequest request = new LoginRequest();
        request.setEmail("nonexistent@example.com");
        request.setPassword("SomePass123");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.login(request));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        assertEquals("Invalid email or password", ex.getReason());
    }

    @Test
    @DisplayName("TC-AUTH-05: Đăng nhập thất bại khi sai mật khẩu")
    void testLogin_WrongPassword_ThrowsUnauthorized() {
        LoginRequest request = new LoginRequest();
        request.setEmail("customer@example.com");
        request.setPassword("WrongPassword");

        Customer user = new Customer();
        user.setId(1L);
        user.setEmail("customer@example.com");
        user.setPasswordHash("hashed_correct_pw");
        user.setRole(Role.CUSTOMER);
        user.setStatus(AccountStatus.ACTIVE);

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "hashed_correct_pw")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.login(request));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        assertEquals("Invalid email or password", ex.getReason());

        verify(jwtService, never()).generateToken(any());
    }

    @Test
    @DisplayName("TC-AUTH-06: Đăng nhập thất bại khi tài khoản bị INACTIVE")
    void testLogin_AccountInactive_ThrowsForbidden() {
        LoginRequest request = new LoginRequest();
        request.setEmail("inactive@example.com");
        request.setPassword("CorrectPassword123");

        Customer user = new Customer();
        user.setId(2L);
        user.setEmail("inactive@example.com");
        user.setPasswordHash("hashed_correct_pw");
        user.setRole(Role.CUSTOMER);
        user.setStatus(AccountStatus.INACTIVE);

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("CorrectPassword123", "hashed_correct_pw")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.login(request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertEquals("Account is not active", ex.getReason());

        verify(jwtService, never()).generateToken(any());
    }

    @Test
    @DisplayName("TC-AUTH-07: Đăng nhập thất bại khi tài khoản bị khóa (LOCKED)")
    void testLogin_AccountLocked_ThrowsForbidden() {
        LoginRequest request = new LoginRequest();
        request.setEmail("locked@example.com");
        request.setPassword("CorrectPassword123");

        Customer user = new Customer();
        user.setId(3L);
        user.setEmail("locked@example.com");
        user.setPasswordHash("hashed_correct_pw");
        user.setRole(Role.CUSTOMER);
        user.setStatus(AccountStatus.LOCKED);

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("CorrectPassword123", "hashed_correct_pw")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.login(request));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        assertEquals("Account is not active", ex.getReason());

        verify(jwtService, never()).generateToken(any());
    }
}
