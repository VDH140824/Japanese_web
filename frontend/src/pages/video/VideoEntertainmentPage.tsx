import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { videoApi } from "../../api/videoApi";
import { VideoPlayer } from "../../components/video/VideoPlayer";
import { useAuthStore } from "../../store/authStore";
import type { VideoCommentResponse, VideoResponse } from "../../types/video";
import "./VideoEntertainmentPage.css";

const PAGE_SIZE = 10;
const RELATED_SIZE = 10;
const COMMENTS_PAGE_SIZE = 20;
const ACTIVE_THRESHOLD = 0.7;

function isPrivilegedRole(role?: string | null) {
  return role?.toUpperCase() === "ADMIN" || role?.toUpperCase() === "MODERATOR";
}

function formatDateTime(value?: string | null) {
  if (!value) return "Unknown";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function VideoEntertainmentPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [videos, setVideos] = useState<VideoResponse[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [requestedRelatedId, setRequestedRelatedId] = useState<number | null>(
    null,
  );
  const [viewedVideoIds, setViewedVideoIds] = useState<Set<number>>(new Set());
  const [likingIds, setLikingIds] = useState<Set<number>>(new Set());
  const [deletingVideoIds, setDeletingVideoIds] = useState<Set<number>>(
    new Set(),
  );
  const [commentsVideoId, setCommentsVideoId] = useState<number | null>(null);
  const [comments, setComments] = useState<VideoCommentResponse[]>([]);
  const [commentsPage, setCommentsPage] = useState(0);
  const [commentsHasMore, setCommentsHasMore] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [deletingCommentIds, setDeletingCommentIds] = useState<Set<number>>(
    new Set(),
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const activeVideo = useMemo(
    () => videos[activeIndex] ?? null,
    [activeIndex, videos],
  );

  const activeCommentsVideo = useMemo(
    () => videos.find((video) => video.id === commentsVideoId) ?? null,
    [commentsVideoId, videos],
  );

  const canModerate = isPrivilegedRole(user?.role);

  useEffect(() => {
    let mounted = true;

    const loadInitialVideos = async () => {
      setIsInitialLoading(true);
      setError(null);

      try {
        const response = await videoApi.getVideos(0, PAGE_SIZE);
        if (!mounted) return;

        const content = response.content ?? [];
        setVideos(content);
        setPage(1);
        setHasMore(!(response.last ?? content.length < PAGE_SIZE));
        setActiveIndex(0);
      } catch {
        if (mounted) {
          setError("Unable to load videos right now. Please try again later.");
        }
      } finally {
        if (mounted) {
          setIsInitialLoading(false);
        }
      }
    };

    void loadInitialVideos();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeVideo?.id) return;
    if (viewedVideoIds.has(activeVideo.id)) return;

    let cancelled = false;

    const markViewed = async () => {
      try {
        await videoApi.markVideoViewed(activeVideo.id);
        if (cancelled) return;
        setViewedVideoIds((prev) => {
          const next = new Set(prev);
          next.add(activeVideo.id);
          return next;
        });
      } catch {
        // Silently ignore view count failures on the frontend.
      }
    };

    void markViewed();

    return () => {
      cancelled = true;
    };
  }, [activeVideo?.id, viewedVideoIds]);

  useEffect(() => {
    if (!activeVideo?.id) return;
    if (videos.length === 0) return;
    if (requestedRelatedId === activeVideo.id) return;

    const distanceToEnd = videos.length - activeIndex - 1;
    if (distanceToEnd > 2) return;

    let cancelled = false;
    const loadRelated = async () => {
      try {
        const related = await videoApi.getRelatedVideos(
          activeVideo.id,
          RELATED_SIZE,
        );
        if (cancelled) return;
        setRequestedRelatedId(activeVideo.id);

        const relatedItems = (related ?? []).filter(
          (item) =>
            item.id !== activeVideo.id &&
            !videos.some((video) => video.id === item.id),
        );

        if (relatedItems.length > 0) {
          setVideos((current) => {
            const existing = new Set(current.map((video) => video.id));
            const next = [...current];
            for (const item of relatedItems) {
              if (!existing.has(item.id)) {
                next.push(item);
                existing.add(item.id);
              }
            }
            return next;
          });
        }
      } catch {
        if (!cancelled) {
          setRequestedRelatedId(activeVideo.id);
        }
      }
    };

    void loadRelated();

    return () => {
      cancelled = true;
    };
  }, [activeIndex, activeVideo?.id, videos, requestedRelatedId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let bestIndex = activeIndex;
        let bestRatio = 0;

        entries.forEach((entry) => {
          const index = Number(
            (entry.target as HTMLElement).dataset.index ?? -1,
          );
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= ACTIVE_THRESHOLD
          ) {
            if (index >= 0) {
              setActiveIndex(index);
            }
          }

          if (entry.intersectionRatio > bestRatio && index >= 0) {
            bestRatio = entry.intersectionRatio;
            bestIndex = index;
          }
        });

        if (bestRatio > 0) {
          setActiveIndex(bestIndex);
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: [0.25, 0.5, 0.7, 0.85],
      },
    );

    itemRefs.current.forEach((item) => {
      if (item) observer.observe(item);
    });

    return () => observer.disconnect();
  }, [activeIndex, videos.length]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isFetchingMore || isInitialLoading)
      return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;

        setIsFetchingMore(true);
        setError(null);

        try {
          const response = await videoApi.getVideos(page, PAGE_SIZE);
          const content = response.content ?? [];

          setVideos((current) => {
            const existingIds = new Set(current.map((video) => video.id));
            const next = [...current];
            for (const item of content) {
              if (!existingIds.has(item.id)) {
                next.push(item);
                existingIds.add(item.id);
              }
            }
            return next;
          });

          setPage((currentPage) => currentPage + 1);
          setHasMore(!(response.last ?? content.length < PAGE_SIZE));
        } catch {
          setError("Unable to load more videos.");
        } finally {
          setIsFetchingMore(false);
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.1,
      },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, isInitialLoading, page]);

  useEffect(() => {
    const nodes = itemRefs.current;
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const index = Number(
          (visible.target as HTMLElement).dataset.index ?? 0,
        );
        setActiveIndex(index);
      },
      {
        root: scrollContainerRef.current,
        threshold: [0.5, 0.7, 0.85],
      },
    );

    nodes.forEach((node) => node && observer.observe(node));

    return () => observer.disconnect();
  }, [videos]);

  useEffect(() => {
    if (!activeVideo) return;
    const node = itemRefs.current[activeIndex];
    if (!node) return;

    node.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeIndex, activeVideo]);

  const updateVideo = (
    videoId: number,
    updater: (video: VideoResponse) => VideoResponse,
  ) => {
    setVideos((current) =>
      current.map((video) => (video.id === videoId ? updater(video) : video)),
    );
  };

  const loadComments = async (
    videoId: number,
    targetPage = 0,
    append = false,
  ) => {
    setCommentsLoading(true);
    setError(null);

    try {
      const response = await videoApi.getVideoComments(
        videoId,
        targetPage,
        COMMENTS_PAGE_SIZE,
      );
      const content = response.content ?? [];
      setComments((current) => (append ? [...current, ...content] : content));
      setCommentsPage(targetPage + 1);
      setCommentsHasMore(
        !(response.last ?? content.length < COMMENTS_PAGE_SIZE),
      );
    } catch {
      setError("Unable to load comments.");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleToggleComments = (videoId: number) => {
    if (commentsVideoId === videoId) {
      setCommentsVideoId(null);
      return;
    }

    setCommentsVideoId(videoId);
    setComments([]);
    setCommentDraft("");
    void loadComments(videoId, 0, false);
  };

  const handleToggleLike = async (video: VideoResponse) => {
    if (likingIds.has(video.id)) return;

    const wasLiked = Boolean(video.likedByCurrentUser);
    const previousCount = video.likeCount ?? 0;
    const optimisticCount = Math.max(0, previousCount + (wasLiked ? -1 : 1));

    setLikingIds((current) => new Set(current).add(video.id));
    updateVideo(video.id, (current) => ({
      ...current,
      likedByCurrentUser: !wasLiked,
      likeCount: optimisticCount,
    }));

    try {
      const response = wasLiked
        ? await videoApi
            .unlikeVideo(video.id)
            .then(() => videoApi.getVideoLikeStatus(video.id))
        : await videoApi.likeVideo(video.id);

      updateVideo(video.id, (current) => ({
        ...current,
        likeCount: response.likeCount ?? optimisticCount,
        likedByCurrentUser: response.likedByCurrentUser ?? !wasLiked,
      }));
    } catch {
      updateVideo(video.id, (current) => ({
        ...current,
        likedByCurrentUser: wasLiked,
        likeCount: previousCount,
      }));
      setError("Unable to update like. Please try again.");
    } finally {
      setLikingIds((current) => {
        const next = new Set(current);
        next.delete(video.id);
        return next;
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!commentsVideoId || !commentDraft.trim()) return;

    setCommentSubmitting(true);
    setError(null);

    try {
      const created = await videoApi.addVideoComment(
        commentsVideoId,
        commentDraft.trim(),
      );
      setComments((current) => [created, ...current]);
      setCommentDraft("");
    } catch {
      setError("Unable to submit comment.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!commentsVideoId) return;
    if (!window.confirm("Delete this comment?")) return;

    setDeletingCommentIds((current) => new Set(current).add(commentId));
    try {
      await videoApi.deleteVideoComment(commentsVideoId, commentId);
      setComments((current) =>
        current.filter((comment) => comment.id !== commentId),
      );
    } catch {
      setError("Unable to delete comment.");
    } finally {
      setDeletingCommentIds((current) => {
        const next = new Set(current);
        next.delete(commentId);
        return next;
      });
    }
  };

  const handleDeleteVideo = async (videoId: number) => {
    if (!window.confirm("Delete this video? This action cannot be undone."))
      return;

    setDeletingVideoIds((current) => new Set(current).add(videoId));
    setError(null);

    try {
      await videoApi.deleteVideo(videoId);
      setVideos((current) => current.filter((video) => video.id !== videoId));
      if (commentsVideoId === videoId) {
        setCommentsVideoId(null);
        setComments([]);
      }
      setActiveIndex((current) =>
        Math.max(0, Math.min(current, videos.length - 2)),
      );
    } catch {
      setError("Unable to delete video.");
    } finally {
      setDeletingVideoIds((current) => {
        const next = new Set(current);
        next.delete(videoId);
        return next;
      });
    }
  };

  const canDeleteVideo = (video: VideoResponse) =>
    canModerate || (user?.id != null && video.uploader?.id === user.id);

  const canDeleteComment = (comment: VideoCommentResponse) =>
    canModerate || (user?.id != null && comment.author?.id === user.id);

  if (!user) {
    return (
      <div className="video-entertainment-page video-entertainment-auth-guard">
        <div className="video-entertainment-empty-state">
          <h1>Sign in required</h1>
          <p>Please sign in to watch videos.</p>
          <button type="button" onClick={() => navigate("/login")}>
            Go to login
          </button>
        </div>
      </div>
    );
  }

  if (isInitialLoading) {
    return (
      <div className="video-entertainment-page video-entertainment-loading">
        <div className="video-entertainment-empty-state">
          <h1>Loading videos...</h1>
          <p>Please wait while we prepare your feed.</p>
        </div>
      </div>
    );
  }

  if (error && videos.length === 0) {
    return (
      <div className="video-entertainment-page video-entertainment-error">
        <div className="video-entertainment-empty-state">
          <h1>Unable to load feed</h1>
          <p>{error}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="video-entertainment-page video-entertainment-empty">
        <div className="video-entertainment-empty-state">
          <h1>No approved videos yet</h1>
          <p>Come back later for fresh entertainment content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-entertainment-page">
      <header className="video-entertainment-header">
        <div>
          <p className="video-entertainment-kicker">Video Entertainment</p>
          <h1>Short-form Japanese learning & entertainment feed</h1>
        </div>

        <div className="video-entertainment-header-actions">
          <button type="button" onClick={() => navigate("/videos/upload")}>
            Upload video
          </button>
        </div>
      </header>

      <div className="video-entertainment-feed" ref={scrollContainerRef}>
        {videos.map((video, index) => (
          <section
            key={video.id}
            className={`video-entertainment-item ${index === activeIndex ? "active" : ""}`}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            data-index={index}
          >
            <VideoPlayer
              video={video}
              active={index === activeIndex}
              muted={muted}
              onToggleMuted={() => setMuted((current) => !current)}
              onToggleLike={() => void handleToggleLike(video)}
              onToggleComments={() => handleToggleComments(video.id)}
              onDelete={() => void handleDeleteVideo(video.id)}
              commentsOpen={commentsVideoId === video.id}
              isLiking={likingIds.has(video.id)}
              isDeleting={deletingVideoIds.has(video.id)}
              canDelete={canDeleteVideo(video)}
              onPlayStateChange={(isPlaying) => {
                if (!isPlaying && index === activeIndex && videos[index + 1]) {
                  // no-op; state is driven by IntersectionObserver
                }
              }}
            />

            {index === videos.length - 1 && (
              <div className="video-entertainment-sentinel" ref={sentinelRef}>
                {hasMore ? "Loading more..." : "You've reached the end."}
              </div>
            )}
          </section>
        ))}
      </div>

      {commentsVideoId && activeCommentsVideo && (
        <aside className="video-comments-panel" aria-label="Video comments">
          <div className="video-comments-header">
            <div>
              <p>Comments</p>
              <h2>{activeCommentsVideo.title}</h2>
            </div>
            <button type="button" onClick={() => setCommentsVideoId(null)}>
              ✕
            </button>
          </div>

          <div className="video-comments-list">
            {comments.map((comment) => (
              <article className="video-comment-card" key={comment.id}>
                <div className="video-comment-avatar">
                  {comment.author?.avatarUrl ? (
                    <img src={comment.author.avatarUrl} alt="" />
                  ) : (
                    <span>
                      {(comment.author?.username ?? "U")
                        .slice(0, 1)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="video-comment-body">
                  <div className="video-comment-meta">
                    <strong>
                      {comment.author?.username ?? "Unknown user"}
                    </strong>
                    <span>{formatDateTime(comment.createdAt)}</span>
                  </div>
                  <p>{comment.content}</p>
                  {canDeleteComment(comment) && (
                    <button
                      type="button"
                      onClick={() => void handleDeleteComment(comment.id)}
                      disabled={deletingCommentIds.has(comment.id)}
                    >
                      {deletingCommentIds.has(comment.id)
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  )}
                </div>
              </article>
            ))}

            {!commentsLoading && comments.length === 0 && (
              <div className="video-comments-empty">No comments yet.</div>
            )}

            {commentsLoading && (
              <div className="video-comments-empty">Loading comments...</div>
            )}

            {commentsHasMore && !commentsLoading && (
              <button
                type="button"
                className="video-comments-load-more"
                onClick={() =>
                  void loadComments(commentsVideoId, commentsPage, true)
                }
              >
                Load more comments
              </button>
            )}
          </div>

          <div className="video-comment-compose">
            <textarea
              value={commentDraft}
              placeholder="Write a comment..."
              onChange={(event) => setCommentDraft(event.target.value)}
              rows={3}
            />
            <button
              type="button"
              onClick={() => void handleSubmitComment()}
              disabled={commentSubmitting || !commentDraft.trim()}
            >
              {commentSubmitting ? "Posting..." : "Post"}
            </button>
          </div>
        </aside>
      )}

      {error && videos.length > 0 && (
        <div className="video-entertainment-toast">{error}</div>
      )}
    </div>
  );
}
