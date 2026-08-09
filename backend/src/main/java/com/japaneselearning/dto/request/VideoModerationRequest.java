package com.japaneselearning.dto.request;

import jakarta.validation.constraints.Size;

public class VideoModerationRequest {

    @Size(max = 500, message = "Reason must be at most 500 characters")
    private String reason;

    public VideoModerationRequest() {
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}