export type VideoStatus = "PENDING" | "APPROVED" | "REJECTED" | string;

export interface VideoUser {
  id?: number;
  username?: string;
  email?: string;
  avatarUrl?: string;
}

export interface VideoCategory {
  id?: number;
  name: string;
  description?: string;
}

export interface VideoResponse {
  id: number;
  title: string;
  description?: string | null;
  videoUrl: string;
  publicId?: string | null;
  thumbnailUrl?: string | null;
  category?: string | null;
  status?: VideoStatus;
  rejectionReason?: string | null;
  viewCount?: number | null;
  likeCount?: number | null;
  likedByCurrentUser?: boolean | null;
  uploader?: VideoUser | null;
  tags?: string[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface VideoCommentAuthor {
  id?: number;
  username?: string;
  avatarUrl?: string;
}

export interface VideoCommentResponse {
  id: number;
  content: string;
  author?: VideoCommentAuthor | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface VideoCommentsPageResponse {
  content: VideoCommentResponse[];
  pageable?: {
    pageNumber?: number;
    pageSize?: number;
    offset?: number;
    paged?: boolean;
    unpaged?: boolean;
    sort?: unknown;
  };
  totalPages?: number;
  totalElements?: number;
  last?: boolean;
  size?: number;
  number?: number;
  sort?: unknown;
  first?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

export interface VideoPageResponse {
  content: VideoResponse[];
  pageable?: {
    pageNumber?: number;
    pageSize?: number;
    offset?: number;
    paged?: boolean;
    unpaged?: boolean;
    sort?: unknown;
  };
  totalPages?: number;
  totalElements?: number;
  last?: boolean;
  size?: number;
  number?: number;
  sort?: unknown;
  first?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

export interface VideoUploadRequest {
  file: File;
  title: string;
  description?: string;
  category: string;
}

export interface VideoModerationRequest {
  rejectionReason?: string;
}
