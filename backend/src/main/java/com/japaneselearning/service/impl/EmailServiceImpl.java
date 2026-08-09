package com.japaneselearning.service.impl;

import com.japaneselearning.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:hungvu140804@gmail.com}")
    private String fromEmail;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendPasswordResetOtp(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Japanese Learning - Password Reset Verification Code");
        
        String text = String.format("""
                Japanese Learning Platform

                Your password reset verification code is:

                %s

                This code will expire in 5 minutes.

                If you did not request a password reset, please ignore this email.
                """, otp);

        message.setText(text);
        mailSender.send(message);
    }

    @Override
    public void sendRegistrationOtp(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Japanese Learning - Account Registration Verification Code");

        String text = String.format("""
                Japanese Learning Platform

                Your account registration verification code is:

                %s

                This code will expire in 5 minutes.

                If you did not request this registration, please ignore this email.
                """, otp);

        message.setText(text);
        mailSender.send(message);
    }
}
