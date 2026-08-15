package com.japaneselearning.service.impl;

import com.japaneselearning.dto.request.VideoCommentRequest;
import com.japaneselearning.dto.request.VideoModerationRequest;
import com.japaneselearning.dto.response.CloudinaryUploadResponse;
import com.japaneselearning.dto.response.VideoCategoryResponse;
import com.japaneselearning.dto.response.VideoCommentResponse;
import com.japaneselearning.dto.response.VideoResponse;
import com.japaneselearning.dto.response.VideoUserResponse;
import com.japaneselearning.entity.Role;
import com.japaneselearning.entity.User;
import com.japaneselearning.entity.Video;
import com.japaneselearning.entity.VideoCategory;
import com.japaneselearning.entity.VideoComment;
import com.japaneselearning.entity.VideoLike;
import com.japaneselearning.entity.VideoModerationHistory;
import com.japaneselearning.entity.VideoTagMapping;
import com.japaneselearning.entity.VideoView;
import com.japaneselearning.repository.UserRepository;
import com.japaneselearning.repository.VideoCategoryRepository;
import com.japaneselearning.repository.VideoCommentRepository;
import com.japaneselearning.repository.VideoLikeRepository;
import com.japaneselearning.repository.VideoModerationHistoryRepository;
import com.japaneselearning.repository.VideoRepository;
import com.japaneselearning.repository.VideoTagMappingRepository;
import com.japaneselearning.repository.VideoViewRepository;
import com.japaneselearning.service.CloudinaryService;
import com.japaneselearning.service.VideoService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@Transactional
public class VideoServiceImpl implements VideoService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_APPROVED = "APPROVED";
    private static final String STATUS_REJECTED = "REJECTED";

    private static final Set<String> ALLOWED_VIDEO_MIME_TYPES = Set.of(
            "video/mp4",
            "video/webm",
            "video/ogg",
            "video/quicktime",
            "video/x-msvideo",
            "video/x-matroska"
    );

    private static final long MAX_FILE_SIZE_BYTES = 200L * 1024L * 1024L;

    private final VideoRepository videoRepository;
    private final VideoCategoryRepository videoCategoryRepository;
    private final VideoTagMappingRepository videoTagMappingRepository;
    private final VideoViewRepository videoViewRepository;
    private final VideoModerationHistoryRepository moderationHistoryRepository;
    private final VideoLikeRepository videoLikeRepository;
    private final VideoCommentRepository videoCommentRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    public VideoServiceImpl(
            VideoRepository videoRepository,
            VideoCategoryRepository videoCategoryRepository,
            VideoTagMappingRepository videoTagMappingRepository,
            VideoViewRepository videoViewRepository,
            VideoModerationHistoryRepository moderationHistoryRepository,
            VideoLikeRepository videoLikeRepository,
            VideoCommentRepository videoCommentRepository,
            UserRepository userRepository,
            CloudinaryService cloudinaryService) {
        this.videoRepository = videoRepository;
        this.videoCategoryRepository = videoCategoryRepository;
        this.videoTagMappingRepository = videoTagMappingRepository;
        this.videoViewRepository = videoViewRepository;
        this.moderationHistoryRepository = moderationHistoryRepository;
        this.videoLikeRepository = videoLikeRepository;
        this.videoCommentRepository = videoCommentRepository;
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @Override
    public VideoResponse uploadVideo(Principal principal, MultipartFile file, String title, String description, String category) {

    User user = requireCurrentUser(principal);

    validateUpload(file, title, category);

    VideoCategory videoCategory = videoCategoryRepository.findByCategoryName(category.trim())
            .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        CloudinaryUploadResponse uploadResponse = cloudinaryService.uploadVideo(file);

        Video video = new Video();
        video.setUser(user);
        video.setCategory(videoCategory);
        video.setTitle(title.trim());
        video.setDescription(description);
        video.setVideoUrl(normalizePlayableVideoUrl(
                uploadResponse.getVideoUrl(),
                uploadResponse.getPublicId(),
                uploadResponse.getResourceType(),
                uploadResponse.getFormat()
        ));
        video.setCloudinaryPublicId(uploadResponse.getPublicId());
        video.setThumbnailUrl(uploadResponse.getThumbnailUrl());
        video.setStatus(STATUS_PENDING);
        video.setViewCount(0L);

        try {
            Video saved = videoRepository.save(video);
            return toResponse(saved, List.of());
        } catch (RuntimeException ex) {
            cloudinaryService.deleteVideo(uploadResponse.getPublicId());
            throw ex;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<VideoCategoryResponse> getVideoCategories() {
        return videoCategoryRepository.findAll(Sort.by(Sort.Direction.ASC, "categoryName"))
                .stream()
                .map(category -> new VideoCategoryResponse(
                        category.getCategoryId(),
                        category.getCategoryName(),
                        category.getDescription()
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VideoResponse> getApprovedVideos(int page, int size, String category) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Video> videos;
        if (category != null && !category.isBlank()) {
            VideoCategory videoCategory = videoCategoryRepository.findByCategoryName(category.trim())
                    .orElse(null);
            if (videoCategory == null) {
                return Page.empty(pageable);
            }
            videos = videoRepository.findByStatusAndCategoryOrderByCreatedAtDesc(STATUS_APPROVED, videoCategory, pageable);
        } else {
            videos = videoRepository.findByStatusOrderByCreatedAtDesc(STATUS_APPROVED, pageable);
        }
        return videos.map(video -> toResponse(video, fetchTags(video.getVideoId())));
    }

    @Override
    @Transactional(readOnly = true)
    public VideoResponse getVideoDetail(Long videoId) {
        Video video = requireApprovedVideo(videoId);
        return toResponse(video, fetchTags(video.getVideoId()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<VideoResponse> getRelatedVideos(Long videoId, int limit) {
        Video current = requireApprovedVideo(videoId);
        List<String> currentTags = fetchTags(current.getVideoId());
        List<Video> candidates = videoRepository.findByStatusOrderByCreatedAtDesc(STATUS_APPROVED);

        List<Video> filtered = candidates.stream()
                .filter(video -> !Objects.equals(video.getVideoId(), current.getVideoId()))
                .sorted(Comparator.comparingInt((Video video) -> scoreRelated(current, video, currentTags)).reversed()
                        .thenComparing(Video::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(Math.max(limit, 1))
                .toList();

        return filtered.stream()
                .map(video -> toResponse(video, fetchTags(video.getVideoId())))
                .toList();
    }

    @Override
    public VideoResponse incrementViewCount(Long videoId) {
        Video video = requireApprovedVideo(videoId);
        video.setViewCount(video.getViewCount() == null ? 1L : video.getViewCount() + 1L);
        videoRepository.save(video);

        VideoView view = new VideoView();
        view.setVideo(video);
        view.setUser(null);
        videoViewRepository.save(view);

        return toResponse(video, fetchTags(video.getVideoId()));
    }

    @Override
    public void deleteVideo(Principal principal, Long videoId) {
        User currentUser = requireCurrentUser(principal);
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new IllegalArgumentException("Video not found"));

        if (!isOwner(currentUser, video) && !hasRole(currentUser, "ADMIN") && !hasRole(currentUser, "MODERATOR")) {
            throw new IllegalArgumentException("You are not allowed to delete this video");
        }

        List<VideoComment> comments = videoCommentRepository.findByVideoVideoIdOrderByCreatedAtDesc(videoId);
        if (comments != null && !comments.isEmpty()) {
            videoCommentRepository.deleteAll(comments);
        }

        List<VideoLike> likes = videoLikeRepository.findByVideoId(videoId);
        if (likes != null && !likes.isEmpty()) {
            videoLikeRepository.deleteAll(likes);
        }

        cloudinaryService.deleteVideo(video.getCloudinaryPublicId());
        videoRepository.delete(video);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VideoResponse> getPendingVideos(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Video> videos = videoRepository.findByStatusOrderByCreatedAtDesc(STATUS_PENDING, pageable);
        return videos.map(video -> toResponse(video, fetchTags(video.getVideoId())));
    }

    @Override
    public VideoResponse approveVideo(Long videoId, VideoModerationRequest request, Principal principal) {
        User moderator = requireCurrentUser(principal);
        ensureModerationRole(moderator);

        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new IllegalArgumentException("Video not found"));
        recordModeration(video, moderator, video.getStatus(), STATUS_APPROVED, request == null ? null : request.getReason());
        video.setStatus(STATUS_APPROVED);
        video.setRejectionReason(null);
        Video saved = videoRepository.save(video);
        return toResponse(saved, fetchTags(saved.getVideoId()));
    }

    @Override
    public VideoResponse rejectVideo(Long videoId, VideoModerationRequest request, Principal principal) {
        User moderator = requireCurrentUser(principal);
        ensureModerationRole(moderator);

        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new IllegalArgumentException("Video not found"));
        recordModeration(video, moderator, video.getStatus(), STATUS_REJECTED, request == null ? null : request.getReason());
        video.setStatus(STATUS_REJECTED);
        video.setRejectionReason(request == null ? null : request.getReason());
        Video saved = videoRepository.save(video);
        return toResponse(saved, fetchTags(saved.getVideoId()));
    }

    @Override
    public VideoResponse likeVideo(Principal principal, Long videoId) {
        User currentUser = requireCurrentUser(principal);
        Video video = requireApprovedVideo(videoId);

        if (videoLikeRepository.findByVideoIdAndUserId(video.getVideoId(), currentUser.getUserId()).isEmpty()) {
            VideoLike like = new VideoLike(video.getVideoId(), currentUser.getUserId());
            videoLikeRepository.save(like);
        }

        return buildVideoWithLikeState(video, currentUser);
    }

    @Override
    public void unlikeVideo(Principal principal, Long videoId) {
        User currentUser = requireCurrentUser(principal);
        Video video = requireApprovedVideo(videoId);
        videoLikeRepository.deleteByVideoIdAndUserId(video.getVideoId(), currentUser.getUserId());
    }

    @Override
    @Transactional(readOnly = true)
    public VideoResponse getVideoLikeStatus(Principal principal, Long videoId) {
        User currentUser = requireCurrentUser(principal);
        Video video = requireApprovedVideo(videoId);
        return buildVideoWithLikeState(video, currentUser);
    }

    @Transactional(readOnly = true)
    public Page<VideoCommentResponse> getVideoComments(Long videoId, int page, int size) {
        requireApprovedVideo(videoId);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by(Sort.Direction.DESC, "createdAt"));
        return videoCommentRepository.findByVideoVideoIdOrderByCreatedAtDesc(videoId, pageable)
                .map(this::toCommentResponse);
    }

    public VideoCommentResponse addVideoComment(Principal principal, Long videoId, VideoCommentRequest request) {
        User currentUser = requireCurrentUser(principal);
        Video video = requireApprovedVideo(videoId);

        VideoComment comment = new VideoComment();
        comment.setVideo(video);
        comment.setUser(currentUser);
        comment.setContent(request.getContent().trim());

        VideoComment saved = videoCommentRepository.save(comment);
        return toCommentResponse(saved);
    }

    public void deleteVideoComment(Principal principal, Long videoId, Long commentId) {
        User currentUser = requireCurrentUser(principal);
        VideoComment comment = videoCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (comment.getVideo() == null || !Objects.equals(comment.getVideo().getVideoId(), videoId)) {
            throw new IllegalArgumentException("Comment not found");
        }

        if (!isCommentOwner(currentUser, comment) && !hasRole(currentUser, "ADMIN") && !hasRole(currentUser, "MODERATOR")) {
            throw new IllegalArgumentException("You are not allowed to delete this comment");
        }

        videoCommentRepository.delete(comment);
    }

    private void validateUpload(MultipartFile file, String title, String category) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Video file is required");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Video file is too large");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_VIDEO_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported video file type");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }
        if (category == null || category.isBlank()) {
            throw new IllegalArgumentException("Category is required");
        }
    }

    private User requireCurrentUser(Principal principal) {

    System.out.println("========== FIND CURRENT USER ==========");

    if (principal == null) {
        throw new IllegalArgumentException("Authenticated user is required");
    }

    System.out.println("Principal class: " + principal.getClass().getName());
    System.out.println("Principal name: " + principal.getName());

    // Google OAuth2 login
    if (principal instanceof org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken oauth2Token) {

        Object emailAttribute = oauth2Token.getPrincipal().getAttributes().get("email");

        System.out.println("OAuth2 email: " + emailAttribute);

        if (emailAttribute != null) {
            User user = userRepository.findByEmail(emailAttribute.toString())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Authenticated Google user not found: " + emailAttribute
                    ));

            System.out.println("User found by Google email: " + user.getUsername());
            System.out.println("User ID: " + user.getUserId());

            return user;
        }
    }

    // Email/password login
    User user = userRepository.findByUsername(principal.getName())
            .orElseGet(() -> userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Authenticated user not found: " + principal.getName()
                    )));

    System.out.println("User found: " + user.getUsername());
    System.out.println("User ID: " + user.getUserId());

    return user;
}

    private Video requireApprovedVideo(Long videoId) {
        return videoRepository.findById(videoId)
                .filter(video -> STATUS_APPROVED.equalsIgnoreCase(video.getStatus()))
                .orElseThrow(() -> new IllegalArgumentException("Video not found"));
    }

    private boolean isOwner(User currentUser, Video video) {
        return video.getUser() != null && Objects.equals(video.getUser().getUserId(), currentUser.getUserId());
    }

    private boolean hasRole(User user, String roleName) {
        Role role = user.getRole();
        return role != null && role.getRoleName() != null && role.getRoleName().equalsIgnoreCase(roleName);
    }

    private void ensureModerationRole(User user) {
        if (!hasRole(user, "ADMIN") && !hasRole(user, "MODERATOR")) {
            throw new IllegalArgumentException("You are not allowed to moderate videos");
        }
    }

    private void recordModeration(Video video, User moderator, String oldStatus, String newStatus, String reason) {
        VideoModerationHistory history = new VideoModerationHistory();
        history.setVideo(video);
        history.setModerator(moderator);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setReason(reason);
        moderationHistoryRepository.save(history);
    }

    private List<String> fetchTags(Long videoId) {
        List<VideoTagMapping> mappings = videoTagMappingRepository.findByVideoId(videoId);
        if (mappings == null || mappings.isEmpty()) {
            return List.of();
        }
        return mappings.stream()
                .map(mapping -> mapping.getTag() != null ? mapping.getTag().getTagName() : null)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }

    private int scoreRelated(Video current, Video candidate, List<String> currentTags) {
        int score = 0;
        if (current.getCategory() != null && candidate.getCategory() != null
                && Objects.equals(current.getCategory().getCategoryId(), candidate.getCategory().getCategoryId())) {
            score += 100;
        }
        List<String> candidateTags = fetchTags(candidate.getVideoId());
        Set<String> overlap = new LinkedHashSet<>(currentTags);
        overlap.retainAll(candidateTags);
        score += overlap.size() * 10;
        return score;
    }

    private VideoResponse toResponse(Video video, List<String> tags) {
        return toResponse(video, tags, null, null);
    }

    private VideoResponse buildVideoWithLikeState(Video video, User currentUser) {
        boolean liked = videoLikeRepository.findByVideoIdAndUserId(video.getVideoId(), currentUser.getUserId()).isPresent();
        long likeCount = videoLikeRepository.countByVideoId(video.getVideoId());
        return toResponse(video, fetchTags(video.getVideoId()), likeCount, liked);
    }

    private VideoResponse toResponse(Video video, List<String> tags, Long likeCount, Boolean likedByCurrentUser) {
        VideoResponse response = new VideoResponse();
        response.setId(video.getVideoId());
        response.setTitle(video.getTitle());
        response.setDescription(video.getDescription());
        response.setVideoUrl(normalizePlayableVideoUrl(
                video.getVideoUrl(),
                video.getCloudinaryPublicId(),
                "video",
                null
        ));
        response.setPublicId(video.getCloudinaryPublicId());
        response.setThumbnailUrl(video.getThumbnailUrl());
        response.setCategory(video.getCategory() != null ? video.getCategory().getCategoryName() : null);
        response.setLevel(null);
        response.setStatus(video.getStatus());
        response.setRejectionReason(video.getRejectionReason());
        response.setViewCount(video.getViewCount());
        response.setLikeCount(likeCount != null ? likeCount : videoLikeRepository.countByVideoId(video.getVideoId()));
        response.setLikedByCurrentUser(likedByCurrentUser != null ? likedByCurrentUser : Boolean.FALSE);
        response.setUploader(toUserResponse(video.getUser()));
        response.setTags(tags == null ? List.of() : new ArrayList<>(tags));
        response.setCreatedAt(video.getCreatedAt());
        response.setUpdatedAt(video.getUpdatedAt());
        return response;
    }

    private VideoCommentResponse toCommentResponse(VideoComment comment) {
        return new VideoCommentResponse(
                comment.getCommentId(),
                comment.getContent(),
                toUserResponse(comment.getUser()),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }

    private boolean isCommentOwner(User currentUser, VideoComment comment) {
        return comment.getUser() != null && Objects.equals(comment.getUser().getUserId(), currentUser.getUserId());
    }

    private VideoUserResponse toUserResponse(User user) {
        if (user == null) {
            return null;
        }
        return new VideoUserResponse(user.getUserId(), user.getUsername(), user.getAvatarUrl());
    }

    private String normalizePlayableVideoUrl(String storedUrl, String publicId, String resourceType, String format) {
        if (storedUrl != null && storedUrl.startsWith("http")) {
            return storedUrl;
        }

        if (publicId == null || publicId.isBlank()) {
            return storedUrl;
        }

        String normalizedFormat = (format == null || format.isBlank()) ? "mp4" : format;
        String playableUrl = cloudinaryService.buildSecureVideoUrl(publicId, normalizedFormat);
        if (playableUrl != null && !playableUrl.isBlank()) {
            return playableUrl;
        }

        return storedUrl;
    }
}
