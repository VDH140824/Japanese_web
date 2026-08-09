import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { videoApi } from "../../api/videoApi";
import type { VideoUploadRequest } from "../../types/video";
import "./VideoUploadPage.css";

const MAX_VIDEO_SIZE_MB = 200;
const SUPPORTED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const CATEGORY_OPTIONS = [
  "Entertainment",
  "Education",
  "Culture",
  "Travel",
  "Music",
  "Lifestyle",
];

const JLPT_OPTIONS = ["N5", "N4", "N3", "N2", "N1"];

export function VideoUploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [level, setLevel] = useState(JLPT_OPTIONS[0]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadState, setUploadState] = useState<
    "idle" | "selecting" | "previewing" | "uploading" | "success" | "failed"
  >("idle");

  const fileInfo = useMemo(() => {
    if (!file) return "";
    const sizeMb = (file.size / 1024 / 1024).toFixed(1);
    return `${file.name} · ${sizeMb} MB`;
  }, [file]);

  const handleFileChange = (selectedFile: File | null) => {
    setError("");
    setSuccessMessage("");

    if (!selectedFile) {
      setFile(null);
      setPreviewUrl("");
      setUploadState("idle");
      return;
    }

    setUploadState("selecting");

    if (!SUPPORTED_TYPES.includes(selectedFile.type)) {
      setError("Unsupported file type. Please upload MP4, WebM, or MOV.");
      setUploadState("failed");
      return;
    }

    if (selectedFile.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      setError(`File size must be under ${MAX_VIDEO_SIZE_MB} MB.`);
      setUploadState("failed");
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setPreviewUrl(url);
    setUploadState("previewing");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccessMessage("");

    if (!file) {
      setError("Please choose a video file.");
      setUploadState("failed");
      return;
    }

    if (!title.trim()) {
      setError("Title is required.");
      setUploadState("failed");
      return;
    }

    const payload: VideoUploadRequest = {
      file,
      title: title.trim(),
      description: description.trim(),
      category,
      level,
    };

    setIsUploading(true);
    setUploadState("uploading");

    try {
      await videoApi.uploadVideo(payload);
      setSuccessMessage(
        "Video uploaded successfully and is waiting for moderation.",
      );
      setUploadState("success");
      setFile(null);
      setTitle("");
      setDescription("");
      setCategory(CATEGORY_OPTIONS[0]);
      setLevel(JLPT_OPTIONS[0]);
      setPreviewUrl("");
    } catch (uploadError) {
      setError("Video upload failed. Please check the file and try again.");
      setUploadState("failed");
      void uploadError;
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="video-upload-page">
      <div className="video-upload-card">
        <header className="video-upload-header">
          <p className="video-upload-kicker">Video Upload</p>
          <h1>Share a new entertainment video</h1>
          <p className="video-upload-subtitle">
            The uploaded video will be submitted for moderation before appearing
            in the public feed.
          </p>
        </header>

        <label className="video-upload-file-picker">
          <span>Select video file</span>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(event) =>
              handleFileChange(event.target.files?.[0] ?? null)
            }
          />
        </label>

        {fileInfo && <div className="video-upload-file-info">{fileInfo}</div>}

        {previewUrl && (
          <div className="video-upload-preview">
            <video src={previewUrl} controls playsInline />
          </div>
        )}

        <div className="video-upload-form-grid">
          <label>
            <span>Title</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter video title"
            />
          </label>

          <label>
            <span>Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tell viewers what this video is about"
              rows={4}
            />
          </label>

          <label>
            <span>Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>JLPT level</span>
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            >
              {JLPT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="video-upload-status">
          <span>Status: {uploadState}</span>
          {isUploading && <span>Uploading...</span>}
        </div>

        {error && <div className="video-upload-error">{error}</div>}
        {successMessage && (
          <div className="video-upload-success">{successMessage}</div>
        )}

        <div className="video-upload-actions">
          <button type="button" onClick={() => navigate("/videos")}>
            Back to feed
          </button>
          <button type="button" onClick={handleSubmit} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload video"}
          </button>
        </div>
      </div>
    </div>
  );
}
