package com.japaneselearning.repository;

import com.japaneselearning.entity.VideoView;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VideoViewRepository extends JpaRepository<VideoView, Long> {
}