package com.japaneselearning.service;

public interface EmailService {

    void sendPasswordResetOtp(String toEmail, String otp);

    void sendRegistrationOtp(String toEmail, String otp);
}
