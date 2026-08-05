package main.java.com.japaneselearning.controller;

import jakarta.validation.Valid;
import main.java.com.japaneselearning.dto.request.ChangePasswordRequest;
import main.java.com.japaneselearning.dto.request.UpdateProfileRequest;
import main.java.com.japaneselearning.dto.response.UserResponse;
import main.java.com.japaneselearning.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@RequestParam("userId") Long userId) {
        return ResponseEntity.ok(authService.getCurrentUser(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @RequestParam("userId") Long userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(userId, request));
    }

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok().build();
    }
}