import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { videoApi } from "../../api/videoApi";
import { useAuthStore } from "../../store/authStore";
import type { VideoUploadRequest } from "../../types/video";
import "./VideoUploadPage.css";

const MAX_VIDEO_SIZE_MB = 200;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
const SUPPORTED_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/ogg",
];

type UploadState =
  "idle" | "loadingCategories" | "ready" | "uploading" | "success" | "error";

type VideoCategoryOption = {
  id?: number;
  name: string;
  description?: string;
};

export function VideoUploadPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [categories, setCategories] = useState<VideoCategoryOption[]>([]);
  const [categoriesState, setCategoriesState] =
    useState<UploadState>("loadingCategories");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fileInfo = useMemo(() => {
    if (!file) return null;
    const sizeMb = (file.size / 1024 / 1024).toFixed(1);
    return {
      name: file.name,
      size: `${sizeMb} MB`,
      type: file.type || "video",
    };
  }, [file]);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      setCategoriesState("loadingCategories");
      try {
        const data = await videoApi.getVideoCategories();
        if (!mounted) return;
        setCategories(data ?? []);
        setCategory((data?.[0]?.name ?? "").trim());
        setCategoriesState("ready");
      } catch {
        if (!mounted) return;
        setCategories([]);
        setCategoriesState("error");
      }
    };

    void loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const setPreviewForFile = (selected: File | null) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (!selected) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(selected);
    objectUrlRef.current = url;
    setPreviewUrl(url);
  };

  const handleFile = (selected: File | null) => {
    setError("");
    setSuccessMessage("");

    if (!selected) {
      setFile(null);
      setPreviewForFile(null);
      return;
    }

    const normalizedType = selected.type?.toLowerCase();
    if (!SUPPORTED_TYPES.includes(normalizedType)) {
      setFile(null);
      setPreviewForFile(null);
      setError(
        "Unsupported file type. Please choose MP4, WebM, MOV, OGG, or MKV.",
      );
      return;
    }

    if (selected.size > MAX_VIDEO_SIZE_BYTES) {
      setFile(null);
      setPreviewForFile(null);
      setError(`File size must be ${MAX_VIDEO_SIZE_MB} MB or less.`);
      return;
    }

    setFile(selected);
    setPreviewForFile(selected);
  };

  const handlePickFile = () => fileInputRef.current?.click();

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0] ?? null;
    handleFile(dropped);
  };

  const handleUpload = async () => {
    setError("");
    setSuccessMessage("");

    if (!file) {
      setError("Please choose a video file.");
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!category.trim()) {
      setError("Please select a video category.");
      return;
    }

    const payload: VideoUploadRequest = {
      file,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
    };

    setUploadState("uploading");
    setProgress(0);

    try {
      const timer = window.setInterval(() => {
        setProgress((current) => Math.min(92, current + 8));
      }, 150);

      await videoApi.uploadVideo(payload);

      window.clearInterval(timer);
      setProgress(100);
      setUploadState("success");
      setSuccessMessage(
        "Video uploaded successfully! Your video has been submitted for moderation. It will appear in Video Entertainment after approval.",
      );

      setFile(null);
      setTitle("");
      setDescription("");
      setPreviewForFile(null);
      setCategory((categories?.[0]?.name ?? "").trim());
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setUploadState("error");
      setError("Video upload failed. Please check the file and try again.");
    }
  };

  const renderCategoryField = () => {
    if (categoriesState === "loadingCategories") {
      return <div className="video-upload-muted">Loading categories...</div>;
    }

    if (categoriesState === "error") {
      return (
        <div className="video-upload-error-box">
          Unable to load categories from the database.
        </div>
      );
    }

    return (
      <select
        className="video-upload-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="" disabled>
          Select video category
        </option>
        {categories.map((item) => (
          <option key={item.id ?? item.name} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>
    );
  };

  if (!user) {
    return (
      <div className="video-upload-page">
        <div className="video-upload-card">
          <h1>Sign in required</h1>
          <p>Please sign in to upload a video.</p>
          <button
            type="button"
            className="video-upload-secondary-btn"
            onClick={() => navigate("/login")}
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-upload-page">
      <div className="video-upload-bg">
        <div className="video-upload-orb video-upload-orb-1" />
        <div className="video-upload-orb video-upload-orb-2" />
        <div className="video-upload-grid" />
      </div>

      <div className="video-upload-shell">
        <div className="video-upload-card">
          <div className="video-upload-header">
            <div className="video-upload-badge">Video Entertainment</div>
            <h1>Share your video</h1>
            <p>Your video will be reviewed before appearing publicly.</p>
          </div>

          {successMessage ? (
            <div className="video-upload-success-panel">
              <strong>Video uploaded successfully!</strong>
              <p>{successMessage}</p>
              <div className="video-upload-actions">
                <button
                  type="button"
                  className="video-upload-secondary-btn"
                  onClick={() => navigate("/videos")}
                >
                  Back to Video Entertainment
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className={`video-dropzone ${file ? "has-file" : ""}`}
                onClick={handlePickFile}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                role="button"
                tabIndex={0}
              >
                <input
                  ref={fileInputRef}
                  className="video-upload-hidden-input"
                  type="file"
                  accept={SUPPORTED_TYPES.join(",")}
                  onChange={(event) =>
                    handleFile(event.target.files?.[0] ?? null)
                  }
                />
                <div className="video-dropzone-icon">＋</div>
                <div className="video-dropzone-copy">
                  <h3>
                    {file ? "Video selected" : "Drag & drop your video here"}
                  </h3>
                  <p>or click to choose a video</p>
                  <span>MP4 / WebM / MOV / MKV / OGG supported</span>
                </div>
              </div>

              {fileInfo && (
                <div className="video-file-meta">
                  <div>
                    <strong>{fileInfo.name}</strong>
                    <span>{fileInfo.size}</span>
                  </div>
                  <button
                    type="button"
                    className="video-upload-link-btn"
                    onClick={() => handleFile(null)}
                  >
                    Remove
                  </button>
                </div>
              )}

              {previewUrl && (
                <div className="video-preview-panel">
                  <video controls playsInline src={previewUrl} />
                </div>
              )}

              <div className="video-upload-form">
                <label className="video-field">
                  <span>Title</span>
                  <input
                    className="video-upload-input"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter video title"
                  />
                </label>

                <label className="video-field">
                  <span>Description</span>
                  <textarea
                    className="video-upload-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell viewers what this video is about"
                    rows={4}
                  />
                </label>

                <label className="video-field">
                  <span>Category</span>
                  {renderCategoryField()}
                </label>
              </div>

              {error && <div className="video-upload-error-box">{error}</div>}

              {uploadState === "uploading" && (
                <div className="video-upload-progress">
                  <div
                    className="video-upload-progress-bar"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <div className="video-upload-actions">
                <button
                  type="button"
                  className="video-upload-secondary-btn"
                  onClick={() => navigate("/videos")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="video-upload-primary-btn"
                  onClick={handleUpload}
                  disabled={
                    uploadState === "uploading" ||
                    categoriesState === "loadingCategories"
                  }
                >
                  {uploadState === "uploading"
                    ? "Uploading..."
                    : "Upload Video"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
