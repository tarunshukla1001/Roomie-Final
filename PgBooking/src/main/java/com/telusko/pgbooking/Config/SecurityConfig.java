package com.telusko.pgbooking.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.CorsConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Registration and login
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/otp/**").permitAll()

                        // Anyone can view properties
                        .requestMatchers(HttpMethod.GET, "/api/properties/**")
                        .permitAll()

                        // Anyone can access AI chat
                        .requestMatchers(HttpMethod.GET, "/api/Gemini/**")
                        .permitAll()

                        // Only OWNER or ADMIN can create properties
                        .requestMatchers(HttpMethod.POST, "/api/properties/**")
                        .hasAnyRole("OWNER", "ADMIN")

                        // Only OWNER or ADMIN can update properties
                        .requestMatchers(HttpMethod.PUT, "/api/properties/**")
                        .hasAnyRole("OWNER", "ADMIN")

                        // Only OWNER or ADMIN can delete properties
                        .requestMatchers(HttpMethod.DELETE, "/api/properties/**")
                        .hasAnyRole("OWNER", "ADMIN")

                        // Anyone can view rooms
                        .requestMatchers(HttpMethod.GET, "/api/rooms/**")
                        .permitAll()

                        // Only authenticated users can create bookings
                        .requestMatchers(HttpMethod.POST, "/api/bookings/**")
                        .authenticated()

                        .requestMatchers(HttpMethod.POST, "/api/visits").permitAll()

                        .requestMatchers("/api/admin/analytics/**")
                        .hasRole("ADMIN")

                        // Everything else requires authentication
                        .anyRequest().authenticated()


                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow credentials (required when explicitly defining origins)
        configuration.setAllowCredentials(true);

        // Explicitly whitelist your local testing URL and live Netlify domain
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "https://roomie01.netlify.app",
                "https://roomie-5lpt77s4l-tarunshukla1001-6416s-projects.vercel.app",
                "https://roomie-3pibchzra-tarunshukla1001-6416s-projects.vercel.app",
                "https://roomie-sigma.vercel.app"
        ));

        configuration.addAllowedHeader("*");
        configuration.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}