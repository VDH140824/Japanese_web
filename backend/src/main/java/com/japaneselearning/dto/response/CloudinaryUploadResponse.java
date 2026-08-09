package com.japaneselearning.dto.response;

public class CloudinaryUploadResponse {

    private String videoUrl;
    private String publicId;
    private String thumbnailUrl;

    public CloudinaryUploadResponse() {
    }

    public CloudinaryUploadResponse(String videoUrl, String publicId, String thumbnailUrl) {
        this.videoUrl = videoUrl;
        this.publicId = publicId;
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }
}