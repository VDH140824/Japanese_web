package com.japaneselearning.repository;

import com.japaneselearning.entity.VideoModerationHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VideoModerationHistoryRepository extends JpaRepository<VideoModerationHistory, Long> {
}