package com.japaneselearning.repository;

import com.japaneselearning.entity.VideoCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VideoCategoryRepository extends JpaRepository<VideoCategory, Long> {

    Optional<VideoCategory> findByCategoryName(String categoryName);
}