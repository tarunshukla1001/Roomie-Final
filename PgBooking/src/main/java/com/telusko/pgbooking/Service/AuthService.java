package com.telusko.pgbooking.Service;

import com.telusko.pgbooking.dto.AuthResponse;
import com.telusko.pgbooking.dto.LoginRequest;
import com.telusko.pgbooking.dto.RegisterRequest;
import com.telusko.pgbooking.Model.Role;
import com.telusko.pgbooking.Model.User;
import com.telusko.pgbooking.Repo.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final OtpService otpService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            OtpService otpService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.otpService = otpService;
    }

    public AuthResponse register(RegisterRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException(
                    "Email already registered"
            );
        }

        // Registration requires verified email
        if (!otpService.isEmailVerified(email)) {
            throw new RuntimeException(
                    "Please verify your email with OTP first"
            );
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(email);

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        // ADMIN can NEVER be created through registration
        Role role = request.getRole();

        if (role == Role.OWNER) {
            user.setRole(Role.OWNER);
        } else {
            user.setRole(Role.USER);
        }

        User savedUser =
                userRepository.save(user);

        // OTP can no longer be reused
        otpService.deleteVerification(email);

        String token =
                jwtService.generateToken(
                        savedUser.getEmail()
                );

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().name()
        );
    }

    public AuthResponse login(LoginRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        email,
                        request.getPassword()
                )
        );

        User user =
                userRepository.findByEmail(
                        email
                ).orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        String token =
                jwtService.generateToken(
                        user.getEmail()
                );

        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}