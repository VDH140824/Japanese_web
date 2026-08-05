package main.java.com.japaneselearning.service.impl;

import main.java.com.japaneselearning.dto.request.ChangePasswordRequest;
import main.java.com.japaneselearning.dto.request.ForgotPasswordRequest;
import main.java.com.japaneselearning.dto.request.LoginRequest;
import main.java.com.japaneselearning.dto.request.RefreshTokenRequest;
import main.java.com.japaneselearning.dto.request.RegisterRequest;
import main.java.com.japaneselearning.dto.request.ResetPasswordRequest;
import main.java.com.japaneselearning.dto.request.UpdateProfileRequest;
import main.java.com.japaneselearning.dto.response.UserResponse;
import main.java.com.japaneselearning.repository.EmailVerificationRepository;
import main.java.com.japaneselearning.repository.PasswordResetRepository;
import main.java.com.japaneselearning.repository.RefreshTokenRepository;
import main.java.com.japaneselearning.repository.RoleRepository;
import main.java.com.japaneselearning.repository.UserProfileRepository;
import main.java.com.japaneselearning.repository.UserRepository;
import main.java.com.japaneselearning.service.AuthService;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final UserProfileRepository userProfileRepository;

    public AuthServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordResetRepository passwordResetRepository,
            EmailVerificationRepository emailVerificationRepository,
            UserProfileRepository userProfileRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordResetRepository = passwordResetRepository;
        this.emailVerificationRepository = emailVerificationRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Override
    public UserResponse register(RegisterRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public UserResponse login(LoginRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public UserResponse refreshToken(RefreshTokenRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public void logout(String refreshToken) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public void verifyEmail(String token) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public UserResponse getCurrentUser(Long userId) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
