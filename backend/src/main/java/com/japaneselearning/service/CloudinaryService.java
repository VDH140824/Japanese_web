package com.japaneselearning.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import com.japaneselearning.dto.response.CloudinaryUploadResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;

@Service
public class CloudinaryService {

    private static final String TARGET_ASSET_FOLDER = "Video/japanese-learning/user_upload";
    private static final Set<String> ALLOWED_VIDEO_CONTENT_TYPES = Set.of(
            "video/mp4",
            "video/webm",
            "video/ogg",
            "video/quicktime",
            "video/x-msvideo",
            "video/x-matroska"
    );

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public CloudinaryUploadResponse uploadVideo(MultipartFile file) {
        validateVideoFile(file);

        Path tempFile = null;
        try {
            String suffix = resolveSuffix(file.getOriginalFilename(), file.getContentType());
            tempFile = Files.createTempFile("video-upload-", suffix);
            file.transferTo(tempFile);

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().uploadLarge(
                    tempFile.toFile(),
                    ObjectUtils.asMap(
                            "resource_type", "video",
                            "asset_folder", TARGET_ASSET_FOLDER,
                            "use_filename", true,
                            "unique_filename", false
                    )
            );

            return new CloudinaryUploadResponse(
                    asString(uploadResult.get("secure_url")),
                    asString(uploadResult.get("public_id")),
                    asString(uploadResult.get("resource_type")),
                    asString(uploadResult.get("format")),
                    asDouble(uploadResult.get("duration")),
                    asInteger(uploadResult.get("width")),
                    asInteger(uploadResult.get("height")),
                    buildThumbnailUrl(uploadResult)
            );
        } catch (IOException e) {
            throw new IllegalStateException("Failed to upload video to Cloudinary", e);
        } finally {
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (IOException ignored) {
                }
            }
        }
    }

    public void deleteVideo(String publicId) {
        if (publicId == null || publicId.isBlank()) {
            return;
        }

        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "video"));
        } catch (IOException e) {
            throw new IllegalStateException("Failed to delete video from Cloudinary", e);
        }
    }

    private void validateVideoFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Video file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("video/") || !ALLOWED_VIDEO_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported video file type");
        }
    }

    private String resolveSuffix(String originalFilename, String contentType) {
        if (originalFilename != null) {
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex >= 0 && dotIndex < originalFilename.length() - 1) {
                String extension = originalFilename.substring(dotIndex);
                return extension.replaceAll("[^a-zA-Z0-9.]", "_");
            }
        }

        if ("video/mp4".equalsIgnoreCase(contentType)) {
            return ".mp4";
        }
        if ("video/webm".equalsIgnoreCase(contentType)) {
            return ".webm";
        }
        if ("video/quicktime".equalsIgnoreCase(contentType)) {
            return ".mov";
        }
        if ("video/ogg".equalsIgnoreCase(contentType)) {
            return ".ogv";
        }
        if ("video/x-matroska".equalsIgnoreCase(contentType)) {
            return ".mkv";
        }
        return ".tmp";
    }

    private String buildThumbnailUrl(Map<String, Object> uploadResult) {
        String publicId = asString(uploadResult.get("public_id"));
        if (publicId == null || publicId.isBlank()) {
            return null;
        }

        return cloudinary.url()
                .secure(true)
                .resourceType("video")
                .transformation(new Transformation().crop("fill").width(640).height(360))
                .format("jpg")
                .generate(publicId);
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Double asDouble(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        return Double.valueOf(String.valueOf(value));
    }

    private Integer asInteger(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        return Integer.valueOf(String.valueOf(value));
    }
}