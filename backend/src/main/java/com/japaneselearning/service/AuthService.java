package com.japaneselearning.service;

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

import java.security.Principal;

public interface AuthService {

    void register(RegisterRequest request);

    UserResponse verifyRegistration(VerifyRegistrationRequest request);

    UserResponse login(LoginRequest request);

    UserResponse refreshToken(RefreshTokenRequest request);

    void forgotPassword(ForgotPasswordRequest request);

    void verifyOtp(VerifyOtpRequest request);

    void resetPassword(ResetPasswordRequest request);

    void changePassword(ChangePasswordRequest request);

    void logout(String refreshToken);

    void verifyEmail(String token);

    UserResponse getCurrentUser(Principal principal);

    UserResponse updateProfile(Long userId, UpdateProfileRequest request);
}

