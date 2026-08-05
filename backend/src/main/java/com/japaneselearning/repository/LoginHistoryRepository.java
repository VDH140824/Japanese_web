package main.java.com.japaneselearning.repository;

import com.japaneselearning.entity.LoginHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {
    List<LoginHistory> findByUserUserIdOrderByLoginTimeDesc(Long userId);
}