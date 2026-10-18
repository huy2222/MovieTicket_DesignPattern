package org.example.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.backend.repository.UserRepository;
import org.example.backend.security.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter(jwtService, userRepository);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("TC-FILTER-01: Không có header Authorization -> Bỏ qua và không xác thực")
    void testFilter_WithoutAuthorizationHeader() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verifyNoInteractions(jwtService);
    }

    @Test
    @DisplayName("TC-FILTER-02: Header không bắt đầu bằng 'Bearer ' -> Bỏ qua và không xác thực")
    void testFilter_NonBearerHeader() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn("Basic dXNlcjpwYXNz");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verifyNoInteractions(jwtService);
    }

    @Test
    @DisplayName("TC-FILTER-03: Token không hợp lệ (isValid = false) -> Không cấp quyền")
    void testFilter_InvalidToken() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn("Bearer invalid_token_xyz");
        when(jwtService.isValid("invalid_token_xyz")).thenReturn(false);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    @DisplayName("TC-FILTER-04: Token CUSTOMER hợp lệ -> Cấp quyền ROLE_CUSTOMER")
    void testFilter_ValidCustomerToken() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn("Bearer valid_customer_token");
        when(jwtService.isValid("valid_customer_token")).thenReturn(true);
        when(jwtService.extractEmail("valid_customer_token")).thenReturn("customer@gmail.com");
        when(jwtService.extractRole("valid_customer_token")).thenReturn("CUSTOMER");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Authentication phải được lưu vào SecurityContext");
        assertEquals("customer@gmail.com", auth.getName());
        assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER")));
    }

    @Test
    @DisplayName("TC-FILTER-05: Token ADMIN hợp lệ -> Cấp quyền ROLE_ADMIN")
    void testFilter_ValidAdminToken() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn("Bearer valid_admin_token");
        when(jwtService.isValid("valid_admin_token")).thenReturn(true);
        when(jwtService.extractEmail("valid_admin_token")).thenReturn("admin@cinema.com");
        when(jwtService.extractRole("valid_admin_token")).thenReturn("ADMIN");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertEquals("admin@cinema.com", auth.getName());
        assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
    }

    @Test
    @DisplayName("TC-FILTER-06: Token STAFF hợp lệ -> Cấp quyền ROLE_STAFF")
    void testFilter_ValidStaffToken() throws ServletException, IOException {
        when(request.getHeader("Authorization")).thenReturn("Bearer valid_staff_token");
        when(jwtService.isValid("valid_staff_token")).thenReturn(true);
        when(jwtService.extractEmail("valid_staff_token")).thenReturn("staff@cinema.com");
        when(jwtService.extractRole("valid_staff_token")).thenReturn("STAFF");

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertEquals("staff@cinema.com", auth.getName());
        assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STAFF")));
    }
}
