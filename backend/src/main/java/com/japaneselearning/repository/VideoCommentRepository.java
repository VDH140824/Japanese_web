package com.japaneselearning.repository;

import com.japaneselearning.entity.VideoComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideoCommentRepository extends JpaRepository<VideoComment, Long> {

    List<VideoComment> findByVideoVideoIdOrderByCreatedAtDesc(Long videoId);

    Page<VideoComment> findByVideoVideoIdOrderByCreatedAtDesc(Long videoId, Pageable pageable);
}
