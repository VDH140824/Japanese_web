import { apiClient } from "../services/api";
import type {
  VideoCommentResponse,
  VideoCommentsPageResponse,
  VideoModerationRequest,
  VideoPageResponse,
  VideoResponse,
  VideoUploadRequest,
} from "../types/video";

function buildVideoFormData(payload: VideoUploadRequest) {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("title", payload.title);
  formData.append("description", payload.description ?? "");
  formData.append("category", payload.category);
  return formData;
}

export const videoApi = {
  getVideos: async (page = 0, size = 10, category?: string) => {
    const { data } = await apiClient.get<VideoPageResponse>("/videos", {
      params: {
        page,
        size,
        ...(category ? { category } : {}),
      },
    });
    return data;
  },

  getVideoById: async (id: number) => {
    const { data } = await apiClient.get<VideoResponse>(`/videos/${id}`);
    return data;
  },

  getRelatedVideos: async (id: number, limit = 10) => {
    const { data } = await apiClient.get<VideoResponse[]>(
      `/videos/${id}/related`,
      {
        params: { limit },
      },
    );
    return data;
  },

  markVideoViewed: async (id: number) => {
    const { data } = await apiClient.post<VideoResponse>(`/videos/${id}/view`);
    return data;
  },

  uploadVideo: async (payload: VideoUploadRequest) => {
    const formData = buildVideoFormData(payload);

    // Let the browser set the multipart boundary automatically.
    // Overriding Content-Type here can break multipart uploads.
    const { data } = await apiClient.post<VideoResponse>("/videos", formData);
    return data;
  },

  getVideoCategories: async () => {
    const { data } =
      await apiClient.get<
        { id?: number; name: string; description?: string }[]
      >("/videos/categories");
    return data;
  },

  likeVideo: async (id: number) => {
    const { data } = await apiClient.post<VideoResponse>(`/videos/${id}/like`);
    return data;
  },

  unlikeVideo: async (id: number) => {
    await apiClient.delete(`/videos/${id}/like`);
  },

  getVideoLikeStatus: async (id: number) => {
    const { data } = await apiClient.get<VideoResponse>(`/videos/${id}/like`);
    return data;
  },

  getVideoComments: async (id: number, page = 0, size = 20) => {
    const { data } = await apiClient.get<VideoCommentsPageResponse>(
      `/videos/${id}/comments`,
      {
        params: { page, size },
      },
    );
    return data;
  },

  addVideoComment: async (id: number, content: string) => {
    const { data } = await apiClient.post<VideoCommentResponse>(
      `/videos/${id}/comments`,
      { content },
    );
    return data;
  },

  deleteVideoComment: async (videoId: number, commentId: number) => {
    await apiClient.delete(`/videos/${videoId}/comments/${commentId}`);
  },

  deleteVideo: async (id: number) => {
    await apiClient.delete(`/videos/${id}`);
  },

  getPendingVideos: async (page = 0, size = 10) => {
    const { data } = await apiClient.get<VideoPageResponse>(
      "/admin/videos/pending",
      {
        params: { page, size },
      },
    );
    return data;
  },

  approveVideo: async (id: number, payload?: VideoModerationRequest) => {
    const { data } = await apiClient.put<VideoResponse>(
      `/admin/videos/${id}/approve`,
      payload ?? {},
    );
    return data;
  },

  rejectVideo: async (id: number, payload?: VideoModerationRequest) => {
    const { data } = await apiClient.put<VideoResponse>(
      `/admin/videos/${id}/reject`,
      payload ?? {},
    );
    return data;
  },
};
