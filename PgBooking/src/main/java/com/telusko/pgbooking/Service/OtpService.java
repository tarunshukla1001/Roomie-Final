package com.telusko.pgbooking.Service;
import org.springframework.transaction.annotation.Transactional;
import com.telusko.pgbooking.Model.OtpVerification;
import com.telusko.pgbooking.Repo.OtpVerificationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private final PasswordEncoder passwordEncoder;

    private final SecureRandom random = new SecureRandom();

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${BREVO_API_KEY}")
    private String brevoApiKey;

    @Value("${BREVO_SENDER_EMAIL}")
    private String senderEmail;

    public OtpService(
            OtpVerificationRepository otpRepository,
            PasswordEncoder passwordEncoder) {

        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;

        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public void sendOtp(String email) {

        email = email.trim().toLowerCase();

        LocalDateTime now = LocalDateTime.now();

        OtpVerification existing =
                otpRepository.findByEmail(email).orElse(null);

        // Prevent OTP spam
        if (existing != null &&
                existing.getLastSentAt() != null &&
                existing.getLastSentAt()
                        .plusSeconds(60)
                        .isAfter(now)) {

            throw new RuntimeException(
                    "Please wait 60 seconds before requesting another OTP"
            );
        }

        String otp =
                String.format("%06d", random.nextInt(1_000_000));

        OtpVerification verification =
                existing != null
                        ? existing
                        : new OtpVerification();

        verification.setEmail(email);

        // Store hashed OTP
        verification.setOtp(
                passwordEncoder.encode(otp)
        );

        verification.setExpiresAt(
                now.plusMinutes(5)
        );

        verification.setLastSentAt(now);
        verification.setAttempts(0);
        verification.setVerified(false);

        /*
         * Send email FIRST.
         * Only save the OTP if Brevo successfully accepts the email.
         */
        sendEmail(email, otp);

        otpRepository.save(verification);
    }

    private void sendEmail(String email, String otp) {

        String url = "https://api.brevo.com/v3/smtp/email";

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        Map<String, Object> sender = Map.of(
                "name", "Roomie",
                "email", senderEmail
        );

        Map<String, Object> recipient = Map.of(
                "email", email
        );

        Map<String, Object> body = Map.of(
                "sender", sender,
                "to", List.of(recipient),
                "subject", "Roomie - Email Verification OTP",
                "htmlContent",
                """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2>Roomie Email Verification</h2>

                    <p>Your Roomie verification OTP is:</p>

                    <div style="
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        margin: 25px 0;
                    ">
                        %s
                    </div>

                    <p>This OTP is valid for <strong>5 minutes</strong>.</p>

                    <p>If you did not request this OTP, you can safely ignore this email.</p>

                    <br>

                    <p>Regards,<br><strong>Roomie Team</strong></p>
                </div>
                """.formatted(otp)
        );

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

        try {

            ResponseEntity<String> response =
                    restTemplate.postForEntity(
                            url,
                            request,
                            String.class
                    );

            if (!response.getStatusCode().is2xxSuccessful()) {

                throw new RuntimeException(
                        "Brevo email service returned: "
                                + response.getStatusCode()
                );
            }

        } catch (Exception e) {

            throw new RuntimeException(
                    "Could not send verification email. Please try again later."
            );
        }
    }

    public void verifyOtp(String email, String otp) {

        email = email.trim().toLowerCase();

        OtpVerification verification =
                otpRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Please request an OTP first"
                                )
                        );

        if (verification.isVerified()) {

            throw new RuntimeException(
                    "Email is already verified"
            );
        }

        if (verification.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new RuntimeException(
                    "OTP has expired. Please request a new OTP"
            );
        }

        if (verification.getAttempts() >= 5) {

            throw new RuntimeException(
                    "Too many incorrect attempts. Please request a new OTP"
            );
        }

        verification.setAttempts(
                verification.getAttempts() + 1
        );

        if (!passwordEncoder.matches(
                otp,
                verification.getOtp())) {

            otpRepository.save(verification);

            throw new RuntimeException(
                    "Invalid OTP"
            );
        }

        verification.setVerified(true);

        otpRepository.save(verification);
    }

    public boolean isEmailVerified(String email) {

        return otpRepository.findByEmail(
                        email.trim().toLowerCase()
                )
                .map(OtpVerification::isVerified)
                .orElse(false);
    }
    @Transactional
    public void deleteVerification(String email) {
        otpRepository.deleteByEmail(email.toLowerCase().trim());
    }
}