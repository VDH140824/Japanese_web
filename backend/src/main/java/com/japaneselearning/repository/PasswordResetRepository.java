package main.java.com.japaneselearning.repository;

import com.japaneselearning.entity.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {
    Optional<PasswordReset> findByResetToken(String resetToken);

    List<PasswordReset> findByUserUserIdAndUsedFalse(Long userId);
}