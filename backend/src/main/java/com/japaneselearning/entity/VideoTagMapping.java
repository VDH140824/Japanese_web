package com.japaneselearning.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "video_tag_mapping")
@IdClass(VideoTagMapping.VideoTagMappingId.class)
public class VideoTagMapping {

    @Id
    @Column(name = "video_id")
    private Long videoId;

    @Id
    @Column(name = "tag_id")
    private Long tagId;

    @ManyToOne
    @JoinColumn(name = "video_id", insertable = false, updatable = false)
    private Video video;

    @ManyToOne
    @JoinColumn(name = "tag_id", insertable = false, updatable = false)
    private VideoTag tag;

    public VideoTagMapping() {
    }

    public VideoTagMapping(Long videoId, Long tagId) {
        this.videoId = videoId;
        this.tagId = tagId;
    }

    public Long getVideoId() {
        return videoId;
    }

    public void setVideoId(Long videoId) {
        this.videoId = videoId;
    }

    public Long getTagId() {
        return tagId;
    }

    public void setTagId(Long tagId) {
        this.tagId = tagId;
    }

    public Video getVideo() {
        return video;
    }

    public void setVideo(Video video) {
        this.video = video;
    }

    public VideoTag getTag() {
        return tag;
    }

    public void setTag(VideoTag tag) {
        this.tag = tag;
    }

    public static class VideoTagMappingId implements Serializable {
        private Long videoId;
        private Long tagId;

        public VideoTagMappingId() {
        }

        public VideoTagMappingId(Long videoId, Long tagId) {
            this.videoId = videoId;
            this.tagId = tagId;
        }

        public Long getVideoId() {
            return videoId;
        }

        public void setVideoId(Long videoId) {
            this.videoId = videoId;
        }

        public Long getTagId() {
            return tagId;
        }

        public void setTagId(Long tagId) {
            this.tagId = tagId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            VideoTagMappingId that = (VideoTagMappingId) o;
            return Objects.equals(videoId, that.videoId) && Objects.equals(tagId, that.tagId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(videoId, tagId);
        }
    }
}