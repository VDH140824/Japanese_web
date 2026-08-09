package com.japaneselearning.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class VideoCommentRequest {

    @NotBlank(message = "Comment content is required")
    @Size(max = 2000, message = "Comment content must be at most 2000 characters")
    private String content;

    public VideoCommentRequest() {
    }

    public VideoCommentRequest(String content) {
        this.content = content;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}