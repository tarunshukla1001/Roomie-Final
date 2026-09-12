package com.telusko.pgbooking.Controller;

import com.telusko.pgbooking.dto.AuthResponse;
import com.telusko.pgbooking.dto.LoginRequest;
import com.telusko.pgbooking.dto.RegisterRequest;
import com.telusko.pgbooking.Service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(
            @Valid @RequestBody RegisterRequest request) {

        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request) {

        return authService.login(request);
    }
}