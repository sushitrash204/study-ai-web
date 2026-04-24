import api from './api';
import { CommunityComment, CommunityFeedResponse, CommunityPost, CreateCommunityPostPayload } from '@/types/community';

export const getDiscoveryFeed = async (params?: {
  page?: number;
  limit?: number;
  subjectId?: string;
}): Promise<CommunityFeedResponse> => {
  const response = await api.get('/study-groups/discovery-feed', { params });
  return response.data;
};

export const getGroupPosts = async (
  groupId: string,
  params?: { page?: number; limit?: number }
): Promise<CommunityFeedResponse> => {
  const response = await api.get(`/study-groups/${groupId}/posts`, { params });
  return response.data;
};

export const createGroupPost = async (
  groupId: string,
  payload: CreateCommunityPostPayload
): Promise<CommunityPost> => {
  const response = await api.post(`/study-groups/${groupId}/posts`, payload);
  return response.data;
};

export const togglePostLike = async (
  postId: string
): Promise<{ id: string; likeCount: number; liked: boolean }> => {
  const response = await api.post(`/study-groups/posts/${postId}/like`);
  return response.data;
};

export const getPostComments = async (postId: string): Promise<CommunityComment[]> => {
  const response = await api.get(`/study-groups/posts/${postId}/comments`);
  return response.data;
};

export const createPostComment = async (
  postId: string,
  payload: { content: string; parentCommentId?: string }
): Promise<CommunityComment> => {
  const response = await api.post(`/study-groups/posts/${postId}/comments`, payload);
  return response.data;
};

export const uploadPostImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/study-groups/posts/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return String(response.data?.url || '');
};
