package com.japaneselearning.service.impl;

import com.japaneselearning.dto.request.ChangePasswordRequest;
import com.japaneselearning.dto.request.ForgotPasswordRequest;
import com.japaneselearning.dto.request.LoginRequest;
import com.japaneselearning.dto.request.RefreshTokenRequest;
import com.japaneselearning.dto.request.RegisterRequest;
import com.japaneselearning.dto.request.ResetPasswordRequest;
import com.japaneselearning.dto.request.UpdateProfileRequest;
import com.japaneselearning.dto.request.VerifyOtpRequest;
import com.japaneselearning.dto.request.VerifyRegistrationRequest;
import com.japaneselearning.dto.response.UserResponse;
import com.japaneselearning.entity.PasswordReset;
import com.japaneselearning.entity.Role;
import com.japaneselearning.entity.User;
import com.japaneselearning.entity.UserProfile;
import com.japaneselearning.entity.UserStatus;
import com.japaneselearning.repository.EmailVerificationRepository;
import com.japaneselearning.repository.PasswordResetRepository;
import com.japaneselearning.repository.RefreshTokenRepository;
import com.japaneselearning.repository.RoleRepository;
import com.japaneselearning.repository.UserProfileRepository;
import com.japaneselearning.repository.UserRepository;
import com.japaneselearning.security.JwtService;
import com.japaneselearning.service.AuthService;
import com.japaneselearning.service.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthServiceImpl implements AuthService {

    private static class PendingRegistration {
        private final String username;
        private final String email;
        private final String passwordHash;
        private final String otp;
        private final LocalDateTime expiresAt;

        public PendingRegistration(String username, String email, String passwordHash, String otp, LocalDateTime expiresAt) {
            this.username = username;
            this.email = email;
            this.passwordHash = passwordHash;
            this.otp = otp;
            this.expiresAt = expiresAt;
        }

        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public String getPasswordHash() { return passwordHash; }
        public String getOtp() { return otp; }
        public LocalDateTime getExpiresAt() { return expiresAt; }
    }

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, PendingRegistration> pendingRegistrations = new ConcurrentHashMap<>();

    public AuthServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordResetRepository passwordResetRepository,
            EmailVerificationRepository emailVerificationRepository,
            UserProfileRepository userProfileRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordResetRepository = passwordResetRepository;
        this.emailVerificationRepository = emailVerificationRepository;
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    @Override
    public void register(RegisterRequest request) {
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

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        String otp = String.format("%06d", secureRandom.nextInt(1000000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5);

        PendingRegistration pending = new PendingRegistration(
                username,
                request.getEmail(),
                encodedPassword,
                otp,
                expiresAt
        );

        pendingRegistrations.put(request.getEmail().toLowerCase(), pending);

        // Send OTP email
        emailService.sendRegistrationOtp(request.getEmail(), otp);
    }

    @Override
    @Transactional
    public UserResponse verifyRegistration(VerifyRegistrationRequest request) {
        String emailKey = request.getEmail().toLowerCase();
        PendingRegistration pending = pendingRegistrations.get(emailKey);

        if (pending == null || !pending.getOtp().equals(request.getOtp())) {
            throw new IllegalArgumentException("Invalid or expired OTP code");
        }

        if (pending.getExpiresAt().isBefore(LocalDateTime.now())) {
            pendingRegistrations.remove(emailKey);
            throw new IllegalArgumentException("OTP code has expired. Please register again.");
        }

        Role userRole = roleRepository.findByRoleName("USER")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setRoleName("USER");
                    role.setDescription("Default user role");
                    return roleRepository.save(role);
                });

        User newUser = new User();
        newUser.setUsername(pending.getUsername());
        newUser.setEmail(pending.getEmail());
        newUser.setPasswordHash(pending.getPasswordHash());
        newUser.setRole(userRole);
        newUser.setStatus(UserStatus.ACTIVE);
        newUser.setEmailVerified(true);
        newUser.setLastLogin(LocalDateTime.now());

        User savedUser = userRepository.save(newUser);

        UserProfile profile = new UserProfile();
        profile.setUser(savedUser);
        profile.setFullName(pending.getUsername());
        userProfileRepository.save(profile);

        pendingRegistrations.remove(emailKey);

        UserResponse response = mapToUserResponse(savedUser);
        response.setAccessToken(jwtService.generateToken(savedUser.getUsername()));
        return response;
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

        UserResponse response = mapToUserResponse(user);
        response.setAccessToken(jwtService.generateToken(user.getUsername()));
        return response;
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

        // Invalidate any existing active OTP tokens for this user
        List<PasswordReset> activeResets = passwordResetRepository.findByUserUserIdAndUsedFalse(user.getUserId());
        for (PasswordReset reset : activeResets) {
            reset.setUsed(true);
        }
        passwordResetRepository.saveAll(activeResets);

        // Generate 6-digit OTP
        String otp = String.format("%06d", secureRandom.nextInt(1000000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5);

        PasswordReset passwordReset = PasswordReset.builder()
                .user(user)
                .resetToken(otp)
                .expiresAt(expiresAt)
                .used(false)
                .build();

        passwordResetRepository.save(passwordReset);

        // Send OTP email
        emailService.sendPasswordResetOtp(user.getEmail(), otp);
    }

    @Override
    @Transactional(readOnly = true)
    public void verifyOtp(VerifyOtpRequest request) {
        PasswordReset passwordReset = passwordResetRepository
                .findTopByUserEmailAndResetTokenAndUsedFalseOrderByCreatedAtDesc(request.getEmail(), request.getOtp())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired OTP code"));

        if (passwordReset.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP code has expired. Please request a new code.");
        }
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        PasswordReset passwordReset = passwordResetRepository
                .findByResetTokenAndUsedFalse(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired OTP code"));

        if (passwordReset.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP code has expired. Please request a new code.");
        }

        User user = passwordReset.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        passwordReset.setUsed(true);
        passwordResetRepository.save(passwordReset);
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
