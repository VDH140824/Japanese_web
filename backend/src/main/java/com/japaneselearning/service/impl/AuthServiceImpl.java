package com.japaneselearning.service.impl;

import com.japaneselearning.dto.request.ChangePasswordRequest;
import com.japaneselearning.dto.request.ForgotPasswordRequest;
import com.japaneselearning.dto.request.LoginRequest;
import com.japaneselearning.dto.request.RefreshTokenRequest;
import com.japaneselearning.dto.request.RegisterRequest;
import com.japaneselearning.dto.request.ResetPasswordRequest;
import com.japaneselearning.dto.request.UpdateProfileRequest;
import com.japaneselearning.dto.response.UserResponse;
import com.japaneselearning.entity.Role;
import com.japaneselearning.entity.User;
import com.japaneselearning.entity.UserStatus;
import com.japaneselearning.repository.EmailVerificationRepository;
import com.japaneselearning.repository.PasswordResetRepository;
import com.japaneselearning.repository.RefreshTokenRepository;
import com.japaneselearning.repository.RoleRepository;
import com.japaneselearning.repository.UserProfileRepository;
import com.japaneselearning.repository.UserRepository;
import com.japaneselearning.security.JwtService;
import com.japaneselearning.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordResetRepository passwordResetRepository,
            EmailVerificationRepository emailVerificationRepository,
            UserProfileRepository userProfileRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordResetRepository = passwordResetRepository;
        this.emailVerificationRepository = emailVerificationRepository;
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        String username = request.getUsername();
        if (username == null || username.isBlank()) {
            username = request.getEmail().split("@")[0];
        }

        if (userRepository.existsByUsername(username)) {
            username = username + "_" + UUID.randomUUID().toString().substring(0, 5);
        }

        Role userRole = roleRepository.findByRoleName("USER")
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .roleName("USER")
                        .description("Default user role")
                        .build()));

        User newUser = User.builder()
                .username(username)
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .lastLogin(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(newUser);
        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        return mapToUserResponse(user);
    }

    @Override
    public UserResponse refreshToken(RefreshTokenRequest request) {
        return null;
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No account found with email: " + request.getEmail()));

        // Simple token generation for password reset simulation
        String token = UUID.randomUUID().toString();
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {
    }

    @Override
    public void logout(String refreshToken) {
    }

    @Override
    public void verifyEmail(String token) {
    }

    @Override
    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return mapToUserResponse(user);
    }

    @Override
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        return null;
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setUserId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setStatus(user.getStatus() != null ? user.getStatus().name() : "ACTIVE");
        response.setEmailVerified(user.getEmailVerified());
        response.setLastLogin(user.getLastLogin());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}
