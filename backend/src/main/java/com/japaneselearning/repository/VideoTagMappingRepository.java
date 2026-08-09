package com.japaneselearning.repository;

import com.japaneselearning.entity.VideoTagMapping;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VideoTagMappingRepository extends JpaRepository<VideoTagMapping, VideoTagMapping.VideoTagMappingId> {

    List<VideoTagMapping> findByVideoId(Long videoId);
}