package com.japaneselearning.repository;

import com.japaneselearning.entity.Video;
import com.japaneselearning.entity.VideoCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VideoRepository extends JpaRepository<Video, Long> {

    Page<Video> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<Video> findByStatusAndCategoryOrderByCreatedAtDesc(String status, VideoCategory category, Pageable pageable);

    Optional<Video> findByVideoIdAndStatus(Long videoId, String status);

    List<Video> findByStatusOrderByCreatedAtDesc(String status);

    List<Video> findByCategoryAndStatusOrderByCreatedAtDesc(VideoCategory category, String status, Pageable pageable);
}