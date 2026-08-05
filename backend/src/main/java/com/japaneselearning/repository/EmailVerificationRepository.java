package main.java.com.japaneselearning.repository;

import main.java.com.japaneselearning.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findByVerificationCode(String verificationCode);

    List<EmailVerification> findByUserUserIdAndVerifiedFalse(Long userId);
}