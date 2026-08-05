package main.java.com.japaneselearning.service;

import main.java.com.japaneselearning.dto.request.ChangePasswordRequest;
import main.java.com.japaneselearning.dto.request.ForgotPasswordRequest;
import main.java.com.japaneselearning.dto.request.LoginRequest;
import main.java.com.japaneselearning.dto.request.RefreshTokenRequest;
import main.java.com.japaneselearning.dto.request.RegisterRequest;
import main.java.com.japaneselearning.dto.request.ResetPasswordRequest;
import main.java.com.japaneselearning.dto.request.UpdateProfileRequest;
import main.java.com.japaneselearning.dto.response.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest request);

    UserResponse login(LoginRequest request);

    UserResponse refreshToken(RefreshTokenRequest request);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    void changePassword(ChangePasswordRequest request);

    void logout(String refreshToken);

    void verifyEmail(String token);

    UserResponse getCurrentUser(Long userId);

    UserResponse updateProfile(Long userId, UpdateProfileRequest request);
}
