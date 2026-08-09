package com.japaneselearning.service;

import com.japaneselearning.dto.request.VideoCommentRequest;
import com.japaneselearning.dto.request.VideoModerationRequest;
import com.japaneselearning.dto.response.VideoCommentResponse;
import com.japaneselearning.dto.response.VideoResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

public interface VideoService {

    VideoResponse uploadVideo(Principal principal, MultipartFile file, String title, String description, String category, String level);

    Page<VideoResponse> getApprovedVideos(int page, int size, String category);

    VideoResponse getVideoDetail(Long videoId);

    List<VideoResponse> getRelatedVideos(Long videoId, int limit);

    VideoResponse incrementViewCount(Long videoId);

    void deleteVideo(Principal principal, Long videoId);

    VideoResponse likeVideo(Principal principal, Long videoId);

    void unlikeVideo(Principal principal, Long videoId);

    VideoResponse getVideoLikeStatus(Principal principal, Long videoId);

    Page<VideoCommentResponse> getVideoComments(Long videoId, int page, int size);

    VideoCommentResponse addVideoComment(Principal principal, Long videoId, VideoCommentRequest request);

    void deleteVideoComment(Principal principal, Long videoId, Long commentId);

    Page<VideoResponse> getPendingVideos(int page, int size);

    VideoResponse approveVideo(Long videoId, VideoModerationRequest request, Principal principal);

    VideoResponse rejectVideo(Long videoId, VideoModerationRequest request, Principal principal);
}