import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { videoApi } from "../../api/videoApi";
import { useAuthStore } from "../../store/authStore";
import type { VideoResponse } from "../../types/video";
import "./VideoModerationPage.css";

export function VideoModerationPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [videos, setVideos] = useState<VideoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  // Reject modal state
  const [rejectModalVideoId, setRejectModalVideoId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const isAdmin =
    user?.role?.toUpperCase() === "ADMIN" ||
    user?.role?.toUpperCase() === "MODERATOR";

  useEffect(() => {
    let mounted = true;

    const loadPendingVideos = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await videoApi.getPendingVideos(0, 50);
        if (!mounted) return;
        setVideos(response.content ?? []);
      } catch {
        if (mounted) {
          setError("Unable to load pending videos.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPendingVideos();

    return () => {
      mounted = false;
    };
  }, []);

  if (!isAdmin) {
    return (
      <div className="vmod-page vmod-forbidden">
        <div className="vmod-empty-state">
          <div className="vmod-forbidden-icon">🚫</div>
          <h1>Access Denied</h1>
          <p>You do not have permission to access moderation tools.</p>
          <button type="button" onClick={() => navigate("/home")}>
            Back to home
          </button>
        </div>
      </div>
    );
  }

  const handleApprove = async (videoId: number) => {
    if (processingIds.has(videoId)) return;
    setError("");
    setMessage("");
    setProcessingIds((prev) => new Set(prev).add(videoId));
    try {
      await videoApi.approveVideo(videoId);
      setVideos((current) => current.filter((video) => video.id !== videoId));
      setMessage("✅ Video approved — it is now visible to all users.");
    } catch {
      setError("Unable to approve this video right now.");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(videoId);
        return next;
      });
    }
  };

  const handleOpenRejectModal = (videoId: number) => {
    setRejectModalVideoId(videoId);
    setRejectReason("");
    setMessage("");
    setError("");
  };

  const handleCloseRejectModal = () => {
    setRejectModalVideoId(null);
    setRejectReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectModalVideoId) return;
    setRejectSubmitting(true);
    try {
      await videoApi.rejectVideo(rejectModalVideoId, {
        reason: rejectReason.trim() || "Rejected by moderator",
      });
      setVideos((current) =>
        current.filter((video) => video.id !== rejectModalVideoId),
      );
      setMessage("❌ Video rejected and removed from the queue.");
      handleCloseRejectModal();
    } catch {
      setError("Unable to reject this video right now.");
    } finally {
      setRejectSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="vmod-page">
        <div className="vmod-empty-state">
          <div className="vmod-spinner" />
          <h1>Loading moderation queue...</h1>
          <p>Fetching pending videos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vmod-page">
      {/* Header */}
      <header className="vmod-header">
        <div className="vmod-header-left">
          <div className="vmod-header-kicker">
            <span className="vmod-admin-badge">👑 {user?.role?.toUpperCase()}</span>
            <span className="vmod-kicker-text">Video Moderation</span>
          </div>
          <h1>Pending Videos Queue</h1>
          <p className="vmod-header-sub">
            {videos.length === 0
              ? "All clear — no videos awaiting review"
              : `${videos.length} video${videos.length !== 1 ? "s" : ""} waiting for review`}
          </p>
        </div>
        <button
          type="button"
          className="vmod-back-btn"
          onClick={() => navigate("/videos")}
        >
          ← Back to Feed
        </button>
      </header>

      {/* Alerts */}
      {message && (
        <div className="vmod-alert vmod-alert-success">{message}</div>
      )}
      {error && <div className="vmod-alert vmod-alert-error">{error}</div>}

      {/* Content */}
      {videos.length === 0 ? (
        <div className="vmod-empty-state">
          <div className="vmod-empty-icon">🎉</div>
          <h2>All caught up!</h2>
          <p>There are no videos waiting for moderation.</p>
          <button type="button" onClick={() => navigate("/videos")}>
            Go to Video Feed
          </button>
        </div>
      ) : (
        <div className="vmod-grid">
          {videos.map((video) => (
            <article key={video.id} className="vmod-card">
              {/* Video preview */}
              <div className="vmod-preview-wrap">
                <video
                  className="vmod-preview"
                  src={video.videoUrl}
                  controls
                  playsInline
                  poster={video.thumbnailUrl ?? undefined}
                />
                <div className="vmod-preview-overlay">
                  <span className="vmod-status-pill">PENDING</span>
                </div>
              </div>

              {/* Info + actions */}
              <div className="vmod-body">
                <h2 className="vmod-title">{video.title}</h2>
                <p className="vmod-description">
                  {video.description ?? "No description provided."}
                </p>

                <dl className="vmod-meta">
                  <div className="vmod-meta-item">
                    <dt>👤 Uploader</dt>
                    <dd>{video.uploader?.username ?? "Unknown"}</dd>
                  </div>
                  <div className="vmod-meta-item">
                    <dt>📂 Category</dt>
                    <dd>{video.category ?? "General"}</dd>
                  </div>
                  <div className="vmod-meta-item">
                    <dt>📅 Uploaded</dt>
                    <dd>
                      {video.createdAt
                        ? new Date(video.createdAt).toLocaleString("vi-VN")
                        : "Unknown"}
                    </dd>
                  </div>
                </dl>

                <div className="vmod-actions">
                  <button
                    type="button"
                    className="vmod-approve-btn"
                    onClick={() => void handleApprove(video.id)}
                    disabled={processingIds.has(video.id)}
                  >
                    {processingIds.has(video.id) ? (
                      <>⏳ Approving...</>
                    ) : (
                      <>✅ Approve</>
                    )}
                  </button>
                  <button
                    type="button"
                    className="vmod-reject-btn"
                    onClick={() => handleOpenRejectModal(video.id)}
                    disabled={processingIds.has(video.id)}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectModalVideoId !== null && (
        <div
          className="vmod-modal-overlay"
          onClick={handleCloseRejectModal}
        >
          <div
            className="vmod-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vmod-modal-header">
              <span className="vmod-modal-icon">❌</span>
              <h2>Reject Video</h2>
              <p>
                Provide a reason so the uploader knows why their video was rejected.
              </p>
            </div>

            <textarea
              className="vmod-modal-textarea"
              placeholder="e.g. Inappropriate content, off-topic, quality issues..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />

            <div className="vmod-modal-actions">
              <button
                type="button"
                className="vmod-modal-cancel"
                onClick={handleCloseRejectModal}
                disabled={rejectSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="vmod-modal-confirm"
                onClick={() => void handleConfirmReject()}
                disabled={rejectSubmitting}
              >
                {rejectSubmitting ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
