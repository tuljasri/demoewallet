package com.ewallet.auth.controller;

import com.ewallet.auth.client.UserClient;
import com.ewallet.auth.dto.UserDto;
import com.ewallet.auth.jwt.JwtUtil;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.code.HashingAlgorithm;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserClient userClient;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager,
                          UserClient userClient,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userClient = userClient;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody UserDto user) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPasskey()));
        UserDto dbUser = userClient.getUserByUsername(user.getUsername());

        if (dbUser.isMfaEnabled()) {
            String tempToken = jwtUtil.generateToken(user.getUsername());
            return Map.of("mfaRequired", true, "tempToken", tempToken, "userId", dbUser.getId());
        }

        String token = jwtUtil.generateToken(user.getUsername());
        return Map.of("mfaRequired", false, "token", token, "userId", dbUser.getId());
    }

    @PostMapping("/enable-mfa")
    public Map<String, String> enableMfa(Authentication auth) throws Exception {
        String username = auth.getName();
        UserDto user = userClient.getUserByUsername(username);

        DefaultSecretGenerator secretGenerator = new DefaultSecretGenerator();
        String secret = secretGenerator.generate();

        user.setMfaSecret(secret);
        user.setMfaEnabled(true);
        userClient.updateUser(user);

        QrData data = new QrData.Builder()
                .label(username)
                .secret(secret)
                .issuer("EWallet")
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();

        ZxingPngQrGenerator generator = new ZxingPngQrGenerator();
        byte[] imageData = generator.generate(data);
        String qrBase64 = Base64.getEncoder().encodeToString(imageData);

        return Map.of("secret", secret, "qrImage", qrBase64);
    }

    @PostMapping("/disable-mfa")
    public Map<String, String> disableMfa(Authentication auth) {
        String username = auth.getName();
        UserDto user = userClient.getUserByUsername(username);
        user.setMfaEnabled(false);
        user.setMfaSecret(null);
        userClient.updateUser(user);
        return Map.of("message", "MFA Disabled");
    }

    @GetMapping("/mfa-status")
    public Map<String, Boolean> getMfaStatus(Authentication auth) {
        String username = auth.getName();
        UserDto user = userClient.getUserByUsername(username);
        return Map.of("enabled", user.isMfaEnabled());
    }

    @PostMapping("/verify-otp")
    public Map<String, String> verifyOtp(@RequestHeader("Authorization") String authHeader, @RequestBody Map<String, String> req) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing token");
        }
        String token = authHeader.substring(7);
        String username = jwtUtil.extractUsername(token);
        String otp = req.get("otp");

        UserDto user = userClient.getUserByUsername(username);
        DefaultCodeGenerator generator = new DefaultCodeGenerator(HashingAlgorithm.SHA1);
        DefaultCodeVerifier verifier = new DefaultCodeVerifier(generator, new SystemTimeProvider());
        verifier.setAllowedTimePeriodDiscrepancy(1);

        boolean isValid = verifier.isValidCode(user.getMfaSecret(), otp);

        if (isValid) {
            String finalToken = jwtUtil.generateToken(username);
            return Map.of("token", finalToken);
        }
        throw new RuntimeException("Invalid OTP");
    }

    @PutMapping("/change-password")
    public Map<String, Object> changePassword(@RequestHeader(value = "Authorization", required = false) String authHeader, @RequestBody Map<String, String> req) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return Map.of("message", "Missing token");
            }
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            UserDto user = userClient.getUserByUsername(username);

            if (user == null) {
                return Map.of("message", "User not found");
            }

            String current = req.get("currentPassword");
            String newPass = req.get("newPassword");

            if (current == null || newPass == null) {
                return Map.of("message", "Invalid input");
            }

            if (!passwordEncoder.matches(current, user.getPasskey())) {
                return Map.of("message", "Wrong current password");
            }

            user.setPasskey(passwordEncoder.encode(newPass));
            userClient.updateUser(user);
            return Map.of("message", "Password updated successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("message", "Server error");
        }
    }
}
