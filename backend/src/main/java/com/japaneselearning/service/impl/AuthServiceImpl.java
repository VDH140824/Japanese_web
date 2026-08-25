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
import com.japaneselearning.entity.EmailVerification;
import com.japaneselearning.entity.PasswordReset;
import com.japaneselearning.entity.RefreshToken;
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
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
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
    @Transactional
    public UserResponse refreshToken(RefreshTokenRequest request) {
        if (request == null || request.getRefreshToken() == null || request.getRefreshToken().isBlank()) {
            throw new IllegalArgumentException("Refresh token is required");
        }

        RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired refresh token"));

        if (Boolean.TRUE.equals(storedToken.getRevoked())) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        if (storedToken.getExpiresAt() != null && storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            storedToken.setRevoked(true);
            refreshTokenRepository.save(storedToken);
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        User user = storedToken.getUser();
        if (user == null) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        UserResponse response = mapToUserResponse(user);
        response.setAccessToken(jwtService.generateToken(user.getUsername()));
        response.setRefreshToken(storedToken.getToken());
        return response;
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
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Invalid password change request");
        }
        if (request.getNewPassword() == null || !request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        User user = getAuthenticatedUser();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }

        refreshTokenRepository.findByToken(refreshToken).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Verification token is required");
        }

        EmailVerification emailVerification = emailVerificationRepository.findByVerificationCode(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification token"));

        if (Boolean.TRUE.equals(emailVerification.getVerified())) {
            return;
        }

        if (emailVerification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification token has expired");
        }

        User user = emailVerification.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        emailVerification.setVerified(true);
        emailVerificationRepository.save(emailVerification);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            throw new IllegalArgumentException("Unauthenticated user");
        }

        User user;
        if (principal instanceof OAuth2AuthenticationToken oauth2AuthenticationToken) {
            OAuth2User oauth2User = oauth2AuthenticationToken.getPrincipal();
            String email = oauth2User.getAttribute("email");
            if (email == null || email.isBlank()) {
                throw new IllegalArgumentException("OAuth2 account email not found");
            }
            user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        } else {
            user = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        }

        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserProfile profile = userProfileRepository.findByUserUserId(userId)
                .orElseGet(() -> UserProfile.builder()
                        .user(user)
                        .build());

        if (request.getFullName() != null) {
            profile.setFullName(request.getFullName());
            user.setUsername(request.getFullName());
        }
        if (request.getBirthday() != null) {
            profile.setBirthday(request.getBirthday());
        }
        if (request.getCountry() != null) {
            profile.setCountry(request.getCountry());
        }
        if (request.getNativeLanguage() != null) {
            profile.setNativeLanguage(request.getNativeLanguage());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }

        userRepository.save(user);
        userProfileRepository.save(profile);

        return mapToUserResponse(user, profile);
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationCredentialsNotFoundException("Authenticated user is required");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof OAuth2User oauth2User) {
            String email = oauth2User.getAttribute("email");
            if (email == null || email.isBlank()) {
                throw new IllegalArgumentException("OAuth2 account email not found");
            }
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        }

        String username = principal instanceof UserDetails userDetails
                ? userDetails.getUsername()
                : authentication.getName();

        if (username == null || username.isBlank()) {
            throw new AuthenticationCredentialsNotFoundException("Authenticated user is required");
        }

        return userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                        .orElseThrow(() -> new IllegalArgumentException("User not found")));
    }

    private UserResponse mapToUserResponse(User user) {
        UserProfile profile = userProfileRepository.findByUserUserId(user.getUserId()).orElse(null);
        return mapToUserResponse(user, profile);
    }

    private UserResponse mapToUserResponse(User user, UserProfile profile) {
        UserResponse response = new UserResponse();
        response.setId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setStatus(user.getStatus() != null ? user.getStatus().name() : "ACTIVE");
        response.setEmailVerified(user.getEmailVerified());
        if (user.getRole() != null) {
            response.setRoleId(user.getRole().getRoleId());
            response.setRole(user.getRole().getRoleName());
        }
        if (profile != null) {
            response.setBirthday(profile.getBirthday());
            response.setCountry(profile.getCountry());
            response.setNativeLanguage(profile.getNativeLanguage());
            response.setBio(profile.getBio());
        }
        response.setLastLogin(user.getLastLogin());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}
