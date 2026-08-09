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
  commentsOpen?: boolean;
  isLiking?: boolean;
  isDeleting?: boolean;
  canDelete?: boolean;
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
  commentsOpen = false,
  isLiking = false,
  isDeleting = false,
  canDelete = false,
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

      <div className="video-player-overlay">
        <div className="video-player-top-row">
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

        <div className="video-player-bottom-sheet">
          <div className="video-player-metadata">
            <div className="video-player-kicker">
              <span>{video.category ?? "General"}</span>
              <span>{video.level ?? "All levels"}</span>
              {typeof video.viewCount === "number" && (
                <span>{video.viewCount} views</span>
              )}
            </div>

            <h2 className="video-player-title">{video.title}</h2>
            {video.description ? (
              <p className="video-player-description">{video.description}</p>
            ) : (
              <p className="video-player-description video-player-description-empty">
                No description provided.
              </p>
            )}

            <div className="video-player-meta-grid">
              <span>
                <strong>Uploader:</strong>{" "}
                {video.uploader?.username ?? "Unknown"}
              </span>
              <span>
                <strong>Created:</strong> {formattedDate || "Unknown"}
              </span>
            </div>

            <div className="video-player-actions">
              <button
                type="button"
                className={`video-action-btn ${video.likedByCurrentUser ? "active" : ""}`}
                onClick={onToggleLike}
                disabled={isLiking}
              >
                {video.likedByCurrentUser ? "♥" : "♡"}{" "}
                {typeof video.likeCount === "number" ? video.likeCount : 0}
              </button>

              <button
                type="button"
                className={`video-action-btn ${commentsOpen ? "active" : ""}`}
                onClick={onToggleComments}
              >
                💬 Comments
              </button>

              {canDelete && (
                <button
                  type="button"
                  className="video-action-btn video-action-btn-danger"
                  onClick={onDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>
        </div>

        {(isLoading || hasError) && (
          <div className="video-player-status">
            {hasError ? "Unable to load video." : "Loading video..."}
          </div>
        )}
      </div>
    </div>
  );
}
