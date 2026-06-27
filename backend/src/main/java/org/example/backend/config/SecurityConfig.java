package org.example.backend.config;

import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource; // Thêm import này

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    // Tự động inject bean corsConfigurationSource từ file CorsConfig của bạn vào đây
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        return http
                // Chuyền corsConfigurationSource vào đây để kích hoạt CORS đúng cách
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) ->
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED))
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // public
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/genres").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/movies", "/api/movies/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/avatars/**").permitAll()
                        .requestMatchers("/ws-cinemeet/**").permitAll()
                        // admin
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/movies/**").hasRole("ADMIN")
                        // phải đăng nhập
                        .requestMatchers("/api/customers/**", "/home", "/api/cinemeet/group-bookings/vnpay-return", "/api/bookings/cities", "/api/bookings/cinemas", "/api/bookings/showtimes/**", "/api/bookings/vnpay-return", "/api/bookings/checkout").permitAll()
                        .requestMatchers("/api/customer/**", "/api/cinemeet/**").authenticated()
                        .anyRequest().permitAll()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS))
                .addFilterBefore(
                        jwtFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .build();
    }
}
