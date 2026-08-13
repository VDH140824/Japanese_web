import { useEffect, useMemo, useRef, useState } from "react";
import type { VideoResponse } from "../../types/video";

interface VideoPlayerProps {
  video: VideoResponse;
  active: boolean;
  muted: boolean;
  onToggleMuted: () => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onToggleLike?: () => void;
  onToggleComments?: () => void;
  onDelete?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  commentsOpen?: boolean;
  isLiking?: boolean;
  isDeleting?: boolean;
  canDelete?: boolean;
  canModerate?: boolean;
  isAdmin?: boolean;
  className?: string;
}

export function VideoPlayer({
  video,
  active,
  muted,
  onToggleMuted,
  onPlayStateChange,
  onToggleLike,
  onToggleComments,
  onDelete,
  onApprove,
  onReject,
  commentsOpen = false,
  isLiking = false,
  isDeleting = false,
  canDelete = false,
  canModerate = false,
  isAdmin = false,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const formattedDate = useMemo(() => {
    if (!video.createdAt) return "";
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(video.createdAt));
    } catch {
      return video.createdAt;
    }
  }, [video.createdAt]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = muted;
  }, [muted]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (!active) {
      el.pause();
      setIsPlaying(false);
      onPlayStateChange?.(false);
      return;
    }

    const playVideo = async () => {
      try {
        await el.play();
        setIsPlaying(true);
        onPlayStateChange?.(true);
      } catch {
        setIsPlaying(false);
        onPlayStateChange?.(false);
      }
    };

    void playVideo();
  }, [active, onPlayStateChange]);

  const handleLoadedData = () => {
    setIsLoading(false);
    setHasError(false);
    if (active) {
      void videoRef.current?.play().catch(() => {
        setIsPlaying(false);
        onPlayStateChange?.(false);
      });
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    onPlayStateChange?.(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    onPlayStateChange?.(false);
  };

  const togglePlay = async () => {
    const el = videoRef.current;
    if (!el) return;

    if (el.paused) {
      try {
        await el.play();
      } catch {
        setIsPlaying(false);
        onPlayStateChange?.(false);
      }
    } else {
      el.pause();
    }
  };

  const likeCount = typeof video.likeCount === "number" ? video.likeCount : 0;
  const isLiked = Boolean(video.likedByCurrentUser);

  return (
    <div className={className ?? "video-player-shell"}>
      <video
        ref={videoRef}
        className="video-player-element"
        src={video.videoUrl}
        poster={video.thumbnailUrl ?? undefined}
        playsInline
        preload="metadata"
        muted={muted}
        loop
        controls={false}
        onLoadedData={handleLoadedData}
        onPlay={handlePlay}
        onPause={handlePause}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
          setIsPlaying(false);
          onPlayStateChange?.(false);
        }}
      />

      {/* Click to play/pause overlay */}
      <button
        type="button"
        className="video-player-click-zone"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause video" : "Play video"}
      />

      <div className="video-player-overlay">
        {/* Top controls */}
        <div className="video-player-top-row">
          {isAdmin && (
            <span className="video-player-admin-badge">
              👑 ADMIN
            </span>
          )}
          <div className="video-player-top-controls">
            <button
              type="button"
              className="video-control-btn"
              onClick={onToggleMuted}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? "🔇" : "🔊"}
            </button>

            <button
              type="button"
              className="video-control-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
          </div>
        </div>

        {/* Right sidebar actions (TikTok style) */}
        <div className="video-player-sidebar-actions">
          {/* Uploader avatar */}
          <div className="video-sidebar-uploader">
            <div className="video-sidebar-avatar">
              {video.uploader?.avatarUrl ? (
                <img src={video.uploader.avatarUrl} alt="" />
              ) : (
                <span>
                  {(video.uploader?.username ?? "U").slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Like button */}
          <button
            type="button"
            className={`video-sidebar-btn ${isLiked ? "liked" : ""}`}
            onClick={onToggleLike}
            disabled={isLiking}
            aria-label={isLiked ? "Unlike" : "Like"}
          >
            <span className="video-sidebar-icon">
              {isLiked ? "❤️" : "🤍"}
            </span>
            <span className="video-sidebar-label">
              {likeCount > 999 ? `${(likeCount / 1000).toFixed(1)}K` : likeCount}
            </span>
          </button>

          {/* Comment button */}
          <button
            type="button"
            className={`video-sidebar-btn ${commentsOpen ? "active" : ""}`}
            onClick={onToggleComments}
            aria-label="Comments"
          >
            <span className="video-sidebar-icon">💬</span>
            <span className="video-sidebar-label">Comment</span>
          </button>

          {/* Delete button */}
          {canDelete && (
            <button
              type="button"
              className="video-sidebar-btn danger"
              onClick={onDelete}
              disabled={isDeleting}
              aria-label="Delete video"
            >
              <span className="video-sidebar-icon">🗑️</span>
              <span className="video-sidebar-label">
                {isDeleting ? "..." : "Delete"}
              </span>
            </button>
          )}

          {/* Admin moderation buttons */}
          {canModerate && video.status === "PENDING" && (
            <>
              <button
                type="button"
                className="video-sidebar-btn approve"
                onClick={onApprove}
                aria-label="Approve video"
              >
                <span className="video-sidebar-icon">✅</span>
                <span className="video-sidebar-label">Approve</span>
              </button>
              <button
                type="button"
                className="video-sidebar-btn reject"
                onClick={onReject}
                aria-label="Reject video"
              >
                <span className="video-sidebar-icon">❌</span>
                <span className="video-sidebar-label">Reject</span>
              </button>
            </>
          )}
        </div>

        {/* Bottom info sheet */}
        <div className="video-player-bottom-sheet">
          <div className="video-player-metadata">
            <div className="video-player-uploader-row">
              <strong className="video-player-username">
                @{video.uploader?.username ?? "Unknown"}
              </strong>
              {video.status && video.status !== "APPROVED" && (
                <span
                  className={`video-player-status-badge status-${video.status.toLowerCase()}`}
                >
                  {video.status}
                </span>
              )}
            </div>

            <div className="video-player-kicker">
              <span>{video.category ?? "General"}</span>
              {typeof video.viewCount === "number" && (
                <span>
                  👁 {video.viewCount > 999 ? `${(video.viewCount / 1000).toFixed(1)}K` : video.viewCount} views
                </span>
              )}
              {video.createdAt && <span>🕐 {formattedDate}</span>}
            </div>

            <h2 className="video-player-title">{video.title}</h2>

            {video.description ? (
              <p className="video-player-description">{video.description}</p>
            ) : (
              <p className="video-player-description video-player-description-empty">
                No description provided.
              </p>
            )}
          </div>
        </div>

        {(isLoading || hasError) && (
          <div className="video-player-status">
            {hasError ? "⚠️ Unable to load video." : "⏳ Loading..."}
          </div>
        )}
      </div>
    </div>
  );
}
