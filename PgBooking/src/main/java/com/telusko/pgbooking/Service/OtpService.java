package com.telusko.pgbooking.Service;

import com.telusko.pgbooking.Model.OtpVerification;
import com.telusko.pgbooking.Repo.OtpVerificationRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpService {

    private final OtpVerificationRepository otpRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    private final SecureRandom random = new SecureRandom();

    public OtpService(
            OtpVerificationRepository otpRepository,
            JavaMailSender mailSender,
            PasswordEncoder passwordEncoder) {

        this.otpRepository = otpRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
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

        // Store hashed OTP, not plain OTP
        verification.setOtp(
                passwordEncoder.encode(otp)
        );

        verification.setExpiresAt(
                now.plusMinutes(5)
        );

        verification.setLastSentAt(now);
        verification.setAttempts(0);
        verification.setVerified(false);

        otpRepository.save(verification);

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(email);
        message.setSubject("Roomie - Email Verification OTP");

        message.setText(
                "Your Roomie verification OTP is: "
                        + otp
                        + "\n\n"
                        + "This OTP is valid for 5 minutes."
                        + "\n\n"
                        + "If you did not request this OTP, ignore this email."
        );

        mailSender.send(message);
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
                ).map(OtpVerification::isVerified)
                .orElse(false);
    }

    public void deleteVerification(String email) {

        otpRepository.deleteByEmail(
                email.trim().toLowerCase()
        );
    }
}