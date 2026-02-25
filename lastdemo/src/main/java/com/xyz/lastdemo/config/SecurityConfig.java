package com.xyz.lastdemo.config;

import com.xyz.lastdemo.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // Disable CSRF
                .csrf(AbstractHttpConfigurer::disable)

                // Configure authorization
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(
                                "/api/auth/**",
                                "/h2-console/**",
                                "/error",
                                "/actuator/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/api/subscribe",
                                "/api/contact",
                                "/api/auth/google"
                        ).permitAll()


                        // WebSocket endpoints
                        .requestMatchers("/ws/**").authenticated()

                        // Admin endpoints - must come before other patterns
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Public worker listing
                        .requestMatchers("/api/workers/**").hasAnyRole("CONSUMER", "WORKER", "ADMIN")

                        // Worker-only endpoints
                        .requestMatchers("/api/worker/**").hasRole("WORKER")

                        // Consumer-only endpoints
                        .requestMatchers("/api/consumer/**").hasRole("CONSUMER")

                        // Chat endpoints
                        .requestMatchers("/api/chat/**").hasAnyRole("CONSUMER", "WORKER")

                        // Notifications
                        .requestMatchers("/api/notifications/**").authenticated()

                        // Dashboard for any authenticated user
                        .requestMatchers("/api/dashboard").authenticated()

                        // All other requests must be authenticated
                        .anyRequest().authenticated()
                )

                // Session management
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Authentication provider
                .authenticationProvider(authenticationProvider())

                // JWT filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        // H2 console configuration (development only - remove in production)
        // ✅ Added COOP headers to allow Google OAuth popup postMessage
        http.headers(headers -> headers
                .frameOptions(frame -> frame.disable())
                .addHeaderWriter(new StaticHeadersWriter(
                        "Cross-Origin-Opener-Policy", "same-origin-allow-popups"))
                .addHeaderWriter(new StaticHeadersWriter(
                        "Cross-Origin-Embedder-Policy", "unsafe-none"))
        );

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}