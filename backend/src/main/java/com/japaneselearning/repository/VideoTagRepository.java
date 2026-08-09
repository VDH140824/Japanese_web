package com.japaneselearning.repository;

import com.japaneselearning.entity.VideoTag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VideoTagRepository extends JpaRepository<VideoTag, Long> {
}