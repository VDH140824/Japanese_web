package main.java.com.japaneselearning.controller;

import jakarta.validation.Valid;
import main.java.com.japaneselearning.dto.request.ForgotPasswordRequest;
import main.java.com.japaneselearning.dto.request.LoginRequest;
import main.java.com.japaneselearning.dto.request.RefreshTokenRequest;
import main.java.com.japaneselearning.dto.request.RegisterRequest;
import main.java.com.japaneselearning.dto.request.ResetPasswordRequest;
import main.java.com.japaneselearning.dto.response.UserResponse;
import main.java.com.japaneselearning.service.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(value = "refreshToken", required = false) String refreshToken) {
        authService.logout(refreshToken);
        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<UserResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/verify")
    public ResponseEntity<Void> verify(@RequestParam("token") String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/google")
    public ResponseEntity<Void> google() {
        return ResponseEntity.notFound().build();
    }
}