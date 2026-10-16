package org.example.backend.service;

import org.example.backend.dto.request.RegisterRequest;
import org.example.backend.dto.response.UserResponse;
import org.example.backend.entity.Customer;
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

    @Test
    @DisplayName("Đăng ký thành công với thông tin hợp lệ")
    void register_success() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@gmail.com");
        req.setFullName("Nguyen Van A");
        req.setPassword("password123");
        req.setPhoneNumber("0987654321");

        when(userRepository.existsByEmail("test@gmail.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("0987654321")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");

        UserResponse res = authService.register(req);

        assertNotNull(res);
        assertEquals("test@gmail.com", res.getEmail());
        assertEquals("Nguyen Van A", res.getFullName());
        assertEquals("CUSTOMER", res.getRole());
        assertEquals("ACTIVE", res.getStatus());

        ArgumentCaptor<Customer> userCaptor = ArgumentCaptor.forClass(Customer.class);
        verify(userRepository).save(userCaptor.capture());
        Customer saved = userCaptor.getValue();
        assertEquals("0987654321", saved.getPhoneNumber());
        assertEquals("encodedPassword", saved.getPasswordHash());
        assertEquals(Role.CUSTOMER, saved.getRole());
        assertEquals(AccountStatus.ACTIVE, saved.getStatus());
        assertNotNull(saved.getProfileCard());
    }

    @Test
    @DisplayName("Đăng ký với số điện thoại quốc tế +84 được chuẩn hóa thành 0 và thành công")
    void register_success_withPlus84() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test84@gmail.com");
        req.setFullName("Nguyen Van B");
        req.setPassword("password123");
        req.setPhoneNumber("+84987654321");

        when(userRepository.existsByEmail("test84@gmail.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("0987654321")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");

        UserResponse res = authService.register(req);

        assertNotNull(res);
        ArgumentCaptor<Customer> userCaptor = ArgumentCaptor.forClass(Customer.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals("0987654321", userCaptor.getValue().getPhoneNumber());
    }

    @Test
    @DisplayName("Bắt lỗi khi email đã được sử dụng")
    void register_duplicateEmail_throwsException() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("existing@gmail.com");
        req.setFullName("User Exists");
        req.setPassword("password123");
        req.setPhoneNumber("0987654321");

        when(userRepository.existsByEmail("existing@gmail.com")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.register(req));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Email đã được sử dụng", ex.getReason());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Bắt lỗi khi số điện thoại đã được sử dụng")
    void register_duplicatePhone_throwsException() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("new@gmail.com");
        req.setFullName("User Exists Phone");
        req.setPassword("password123");
        req.setPhoneNumber("0987654321");

        when(userRepository.existsByEmail("new@gmail.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("0987654321")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.register(req));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Số điện thoại đã được sử dụng", ex.getReason());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Bắt lỗi khi số điện thoại thiếu số (dưới 10 số)")
    void register_phoneTooShort_throwsException() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@gmail.com");
        req.setFullName("User");
        req.setPassword("password123");
        req.setPhoneNumber("0987654");

        when(userRepository.existsByEmail("test@gmail.com")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.register(req));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Số điện thoại không đúng định dạng"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Bắt lỗi khi số điện thoại thừa số (trên 10 số)")
    void register_phoneTooLong_throwsException() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@gmail.com");
        req.setFullName("User");
        req.setPassword("password123");
        req.setPhoneNumber("098765432101");

        when(userRepository.existsByEmail("test@gmail.com")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.register(req));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Số điện thoại không đúng định dạng"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Bắt lỗi khi số điện thoại không bắt đầu bằng số 0")
    void register_phoneNotStartingWithZero_throwsException() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@gmail.com");
        req.setFullName("User");
        req.setPassword("password123");
        req.setPhoneNumber("1987654321");

        when(userRepository.existsByEmail("test@gmail.com")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.register(req));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Số điện thoại không đúng định dạng"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Bắt lỗi khi số điện thoại chứa chữ cái hoặc ký tự không hợp lệ")
    void register_phoneWithLetters_throwsException() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@gmail.com");
        req.setFullName("User");
        req.setPassword("password123");
        req.setPhoneNumber("0987654abc");

        when(userRepository.existsByEmail("test@gmail.com")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.register(req));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Số điện thoại không đúng định dạng"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Bắt lỗi khi số điện thoại để trống")
    void register_emptyPhone_throwsException() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@gmail.com");
        req.setFullName("User");
        req.setPassword("password123");
        req.setPhoneNumber("");

        when(userRepository.existsByEmail("test@gmail.com")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.register(req));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Số điện thoại không được để trống", ex.getReason());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Bắt lỗi khi email để trống")
    void register_emptyEmail_throwsException() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("");
        req.setFullName("User");
        req.setPassword("password123");
        req.setPhoneNumber("0987654321");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.register(req));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Email không được để trống", ex.getReason());
        verify(userRepository, never()).save(any());
    }
}
