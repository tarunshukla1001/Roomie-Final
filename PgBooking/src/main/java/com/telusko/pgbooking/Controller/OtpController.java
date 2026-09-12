package com.telusko.pgbooking.Controller;

import com.telusko.pgbooking.Service.OtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/otp")
public class OtpController {

    private final OtpService otpService;

    public OtpController(OtpService otpService) {
        this.otpService = otpService;
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendOtp(
            @RequestParam String email) {

        otpService.sendOtp(email);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "OTP sent successfully"
                )
        );
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(
            @RequestParam String email,
            @RequestParam String otp) {

        otpService.verifyOtp(email, otp);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Email verified successfully"
                )
        );
    }
}