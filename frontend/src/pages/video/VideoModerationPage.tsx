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

  const isAdmin =
    user?.role?.toUpperCase() === "ADMIN" ||
    user?.role?.toUpperCase() === "MODERATOR";

  useEffect(() => {
    let mounted = true;

    const loadPendingVideos = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await videoApi.getPendingVideos(0, 20);
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
      <div className="video-moderation-page video-moderation-forbidden">
        <div className="video-moderation-empty-state">
          <h1>Access denied</h1>
          <p>You do not have permission to access moderation tools.</p>
          <button type="button" onClick={() => navigate("/home")}>
            Back to home
          </button>
        </div>
      </div>
    );
  }

  const handleApprove = async (videoId: number) => {
    setError("");
    try {
      await videoApi.approveVideo(videoId);
      setVideos((current) => current.filter((video) => video.id !== videoId));
      setMessage("Video approved successfully.");
    } catch {
      setError("Unable to approve this video right now.");
    }
  };

  const handleReject = async (videoId: number) => {
    setError("");
    try {
      await videoApi.rejectVideo(videoId, {
        rejectionReason: "Rejected by moderator",
      });
      setVideos((current) => current.filter((video) => video.id !== videoId));
      setMessage("Video rejected successfully.");
    } catch {
      setError("Unable to reject this video right now.");
    }
  };

  if (isLoading) {
    return (
      <div className="video-moderation-page">
        <div className="video-moderation-empty-state">
          <h1>Loading moderation queue...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="video-moderation-page">
      <header className="video-moderation-header">
        <div>
          <p className="video-moderation-kicker">Admin Moderation</p>
          <h1>Pending videos</h1>
        </div>
        <button type="button" onClick={() => navigate("/videos")}>
          Open feed
        </button>
      </header>

      {message && <div className="video-moderation-success">{message}</div>}
      {error && <div className="video-moderation-error">{error}</div>}

      {videos.length === 0 ? (
        <div className="video-moderation-empty-state">
          <h2>No pending videos</h2>
          <p>Everything is approved for now.</p>
        </div>
      ) : (
        <div className="video-moderation-grid">
          {videos.map((video) => (
            <article key={video.id} className="video-moderation-card">
              <video
                className="video-moderation-preview"
                src={video.videoUrl}
                controls
                playsInline
                poster={video.thumbnailUrl ?? undefined}
              />

              <div className="video-moderation-body">
                <h2>{video.title}</h2>
                <p>{video.description ?? "No description provided."}</p>

                <dl className="video-moderation-meta">
                  <div>
                    <dt>Uploader</dt>
                    <dd>{video.uploader?.username ?? "Unknown"}</dd>
                  </div>
                  <div>
                    <dt>Category</dt>
                    <dd>{video.category ?? "General"}</dd>
                  </div>
                  <div>
                    <dt>Created</dt>
                    <dd>
                      {video.createdAt
                        ? new Date(video.createdAt).toLocaleString()
                        : "Unknown"}
                    </dd>
                  </div>
                </dl>

                <div className="video-moderation-actions">
                  <button type="button" onClick={() => handleApprove(video.id)}>
                    Approve
                  </button>
                  <button type="button" onClick={() => handleReject(video.id)}>
                    Reject
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
