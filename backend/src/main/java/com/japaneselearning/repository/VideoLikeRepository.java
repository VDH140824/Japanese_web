package com.japaneselearning.repository;

import com.japaneselearning.entity.VideoLike;
import com.japaneselearning.entity.VideoLike.VideoLikeId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VideoLikeRepository extends JpaRepository<VideoLike, VideoLikeId> {

    Optional<VideoLike> findByVideoIdAndUserId(Long videoId, Long userId);

    long countByVideoId(Long videoId);

    void deleteByVideoIdAndUserId(Long videoId, Long userId);

    List<VideoLike> findByVideoId(Long videoId);
}