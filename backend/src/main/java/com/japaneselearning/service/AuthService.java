package com.japaneselearning.service;

import com.japaneselearning.dto.request.ChangePasswordRequest;
import com.japaneselearning.dto.request.ForgotPasswordRequest;
import com.japaneselearning.dto.request.LoginRequest;
import com.japaneselearning.dto.request.RefreshTokenRequest;
import com.japaneselearning.dto.request.RegisterRequest;
import com.japaneselearning.dto.request.ResetPasswordRequest;
import com.japaneselearning.dto.request.UpdateProfileRequest;
import com.japaneselearning.dto.response.UserResponse;

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

