package org.example.backend.controller;

import org.example.backend.dto.request.LoginRequest;
import org.example.backend.dto.request.RegisterRequest;
import org.example.backend.dto.response.AuthResponse;
import org.example.backend.dto.response.UserResponse;
import org.example.backend.enums.Role;
import org.example.backend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    private AuthController authController;

    @BeforeEach
    void setUp() {
        authController = new AuthController(authService);
    }

    @Test
    @DisplayName("TC-CTRL-01: Endpoint /api/auth/register chuyển tiếp request sang AuthService và trả về kết quả")
    void testRegister_DelegatesToAuthService() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@gmail.com");
        request.setFullName("Test User");
        request.setPassword("123456");

        UserResponse mockResponse = UserResponse.builder()
                .id(1L)
                .email("test@gmail.com")
                .fullName("Test User")
                .role("CUSTOMER")
                .status("ACTIVE")
                .build();

        when(authService.register(request)).thenReturn(mockResponse);

        UserResponse result = authController.register(request);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("test@gmail.com", result.getEmail());
        verify(authService).register(request);
    }

    @Test
    @DisplayName("TC-CTRL-02: Endpoint /api/auth/login chuyển tiếp request sang AuthService và trả về AuthResponse")
    void testLogin_DelegatesToAuthService() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@gmail.com");
        request.setPassword("123456");

        AuthResponse mockResponse = AuthResponse.builder()
                .id(1L)
                .email("test@gmail.com")
                .fullName("Test User")
                .token("mocked_jwt_token")
                .role(Role.CUSTOMER)
                .build();

        when(authService.login(request)).thenReturn(mockResponse);

        AuthResponse result = authController.login(request);

        assertNotNull(result);
        assertEquals("mocked_jwt_token", result.getToken());
        assertEquals(Role.CUSTOMER, result.getRole());
        verify(authService).login(request);
    }
}
