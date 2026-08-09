package com.japaneselearning.controller;

import com.japaneselearning.dto.request.VideoCommentRequest;
import com.japaneselearning.dto.request.VideoModerationRequest;
import com.japaneselearning.dto.response.VideoCommentResponse;
import com.japaneselearning.dto.response.VideoResponse;
import com.japaneselearning.service.VideoService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/videos")
public class VideoController {

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VideoResponse> uploadVideo(
            Principal principal,
            @RequestPart("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("category") String category,
            @RequestParam(value = "level", required = false) String level) {
        return ResponseEntity.ok(videoService.uploadVideo(principal, file, title, description, category, level));
    }

    @GetMapping
    public ResponseEntity<Page<VideoResponse>> getVideos(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(videoService.getApprovedVideos(page, size, category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VideoResponse> getVideoDetail(@PathVariable Long id) {
        return ResponseEntity.ok(videoService.getVideoDetail(id));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<List<VideoResponse>> getRelatedVideos(
            @PathVariable Long id,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int limit) {
        return ResponseEntity.ok(videoService.getRelatedVideos(id, limit));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<VideoResponse> incrementViewCount(@PathVariable Long id) {
        return ResponseEntity.ok(videoService.incrementViewCount(id));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<VideoResponse> likeVideo(Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(videoService.likeVideo(principal, id));
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<Void> unlikeVideo(Principal principal, @PathVariable Long id) {
        videoService.unlikeVideo(principal, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/like")
    public ResponseEntity<VideoResponse> getVideoLikeStatus(Principal principal, @PathVariable Long id) {
        return ResponseEntity.ok(videoService.getVideoLikeStatus(principal, id));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<Page<VideoCommentResponse>> getVideoComments(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size) {
        return ResponseEntity.ok(videoService.getVideoComments(id, page, size));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<VideoCommentResponse> addVideoComment(
            Principal principal,
            @PathVariable Long id,
            @RequestBody VideoCommentRequest request) {
        return ResponseEntity.ok(videoService.addVideoComment(principal, id, request));
    }

    @DeleteMapping("/{videoId}/comments/{commentId}")
    public ResponseEntity<Void> deleteVideoComment(
            Principal principal,
            @PathVariable Long videoId,
            @PathVariable Long commentId) {
        videoService.deleteVideoComment(principal, videoId, commentId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVideo(Principal principal, @PathVariable Long id) {
        videoService.deleteVideo(principal, id);
        return ResponseEntity.noContent().build();
    }
}
