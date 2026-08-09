package com.japaneselearning.controller;

import com.japaneselearning.dto.request.VideoModerationRequest;
import com.japaneselearning.dto.response.VideoResponse;
import com.japaneselearning.service.VideoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/admin/videos")
public class AdminVideoController {

    private final VideoService videoService;

    public AdminVideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @GetMapping("/pending")
    public ResponseEntity<Page<VideoResponse>> getPendingVideos(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "0") @Min(0) int page,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        return ResponseEntity.ok(videoService.getPendingVideos(page, size));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<VideoResponse> approveVideo(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) VideoModerationRequest request,
            Principal principal) {
        return ResponseEntity.ok(videoService.approveVideo(id, request, principal));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<VideoResponse> rejectVideo(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) VideoModerationRequest request,
            Principal principal) {
        return ResponseEntity.ok(videoService.rejectVideo(id, request, principal));
    }
}