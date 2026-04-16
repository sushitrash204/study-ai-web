import api from './api';
import { StudyGroup, GroupMember } from '@/types/studyGroup';
export type { StudyGroup, GroupMember };

/**
 * Create new study group
 */
export const createStudyGroup = async (
  name: string,
  data?: {
    description?: string;
    isPublic?: boolean;
    avatarUrl?: string;
    rules?: string;
  }
): Promise<StudyGroup> => {
  const response = await api.post('/study-groups', { name, ...data });
  return response.data;
};

/**
 * List all public study groups
 */
export const listStudyGroups = async (
  page = 1,
  limit = 10,
  search?: string
): Promise<{ groups: StudyGroup[]; total: number; page: number; limit: number }> => {
  const response = await api.get('/study-groups', { params: { page, limit, isPublic: true, search } });
  return response.data;
};

/**
 * Get user's study groups
 */
export const getUserStudyGroups = async (): Promise<StudyGroup[]> => {
  const response = await api.get('/study-groups/my-groups');
  return response.data;
};

/**
 * Get study group details
 */
export const getStudyGroupDetail = async (groupId: string): Promise<StudyGroup> => {
  const response = await api.get(`/study-groups/${groupId}`);
  return response.data;
};

/**
 * Update study group
 */
export const updateStudyGroup = async (
  groupId: string,
  data: {
    name?: string;
    description?: string;
    isPublic?: boolean;
    avatarUrl?: string;
    rules?: string;
  }
): Promise<StudyGroup> => {
  const response = await api.put(`/study-groups/${groupId}`, data);
  return response.data;
};

/**
 * Upload avatar for study group
 */
export const uploadAvatar = async (
  groupId: string,
  file: File
): Promise<StudyGroup> => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await api.post(
    `/study-groups/${groupId}/avatar`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * Delete study group
 */
export const deleteStudyGroup = async (groupId: string): Promise<any> => {
  const response = await api.delete(`/study-groups/${groupId}`);
  return response.data;
};

/**
 * Get or create invite link
 */
export const getOrCreateInviteLink = async (groupId: string): Promise<any> => {
  const response = await api.post(`/study-groups/${groupId}/invite-link`);
  return response.data;
};

/**
 * Join group using invite code
 */
export const joinByCode = async (code: string): Promise<any> => {
  const response = await api.post('/study-groups/join-by-code', { code });
  return response.data;
};

/**
 * Request to join private group
 */
export const requestJoinGroup = async (groupId: string): Promise<any> => {
  const response = await api.post(`/study-groups/${groupId}/request-join`);
  return response.data;
};

export const requestJoin = requestJoinGroup;

/**
 * Get group members
 */
export const getGroupMembers = async (groupId: string): Promise<GroupMember[]> => {
  const response = await api.get(`/study-groups/${groupId}/members`);
  return response.data;
};

/**
 * Leave group
 */
export const leaveGroup = async (groupId: string): Promise<any> => {
  const response = await api.post(`/study-groups/${groupId}/leave`);
  return response.data;
};

/**
 * Get pending join requests (admin only)
 */
export const getPendingJoinRequests = async (groupId: string): Promise<any> => {
  const response = await api.get(`/study-groups/${groupId}/join-requests`);
  return response.data;
};

/**
 * Approve join request (admin only)
 */
export const approveJoinRequest = async (groupId: string, requestId: string): Promise<any> => {
  const response = await api.post(
    `/study-groups/${groupId}/join-requests/${requestId}/approve`
  );
  return response.data;
};

/**
 * Reject join request (admin only)
 */
export const rejectJoinRequest = async (groupId: string, requestId: string): Promise<any> => {
  const response = await api.post(
    `/study-groups/${groupId}/join-requests/${requestId}/reject`
  );
  return response.data;
};

/**
 * Promote member to admin (owner only)
 */
export const promoteToAdmin = async (groupId: string, memberId: string): Promise<any> => {
  const response = await api.post(
    `/study-groups/${groupId}/members/${memberId}/promote`
  );
  return response.data;
};

/**
 * Demote admin to member (owner only)
 */
export const demoteToMember = async (groupId: string, memberId: string): Promise<any> => {
  const response = await api.post(
    `/study-groups/${groupId}/members/${memberId}/demote`
  );
  return response.data;
};

/**
 * Ban member from group
 */
export const banMember = async (groupId: string, memberId: string): Promise<any> => {
  const response = await api.post(
    `/study-groups/${groupId}/members/${memberId}/ban`
  );
  return response.data;
};

/**
 * Send message to group
 */
export const sendMessage = async (
  groupId: string,
  content: string,
  type: 'TEXT' | 'DOCUMENT' | 'EXERCISE' = 'TEXT',
  resourceId?: string,
  replyToMessageId?: string
): Promise<any> => {
  const response = await api.post(`/study-groups/${groupId}/messages`, {
    content,
    type,
    resourceId,
    replyToMessageId,
  });
  return response.data;
};

/**
 * Get group messages
 */
export const getMessages = async (
  groupId: string,
  limit = 50,
  offset = 0
): Promise<any[]> => {
  const response = await api.get(`/study-groups/${groupId}/messages`, {
    params: { limit, offset },
  });
  return response.data;
};

/**
 * Share resource to group
 */
export const shareResource = async (
  groupId: string,
  resourceId: string,
  resourceType: 'DOCUMENT' | 'EXERCISE'
): Promise<any> => {
  const response = await api.post(`/study-groups/${groupId}/share-resource`, {
    resourceId,
    resourceType,
  });
  return response.data;
};

/**
 * Get shared resources in group
 */
export const getSharedResources = async (
  groupId: string,
  resourceType?: 'DOCUMENT' | 'EXERCISE'
): Promise<any> => {
  const response = await api.get(`/study-groups/${groupId}/shared-resources`, {
    params: { resourceType },
  });
  return response.data;
};

/**
 * Unshare resource from group
 */
export const unshareResource = async (
  groupId: string,
  sharedResourceId: string
): Promise<any> => {
  const response = await api.delete(
    `/study-groups/${groupId}/shared-resources/${sharedResourceId}`
  );
  return response.data;
};

// ========== Shared Results & Leaderboard ==========

/**
 * Share exercise result to group
 */
export const shareResult = async (
    groupId: string,
    payload: {
        exerciseId: string;
        submissionId: string;
        score: number;
        totalQuestions: number;
        correctCount: number;
    }
): Promise<any> => {
    const response = await api.post(`/study-groups/${groupId}/share-result`, payload);
    return response.data;
};

/**
 * Get shared results in group
 */
export const getSharedResults = async (groupId: string): Promise<any> => {
    const response = await api.get(`/study-groups/${groupId}/shared-results`);
    return response.data;
};

/**
 * Get group leaderboard
 */
export const getLeaderboard = async (
    groupId: string,
    period: 'all' | 'week' | 'month' = 'all'
): Promise<any> => {
    const response = await api.get(`/study-groups/${groupId}/leaderboard`, {
        params: { period },
    });
    return response.data;
};

/**
 * Unshare result from group
 */
export const unshareResult = async (
    groupId: string,
    resultId: string
): Promise<any> => {
    const response = await api.delete(`/study-groups/${groupId}/shared-results/${resultId}`);
    return response.data;
};
/**
 * AI Group Summary
 */
export const summarizeGroupChat = async (groupId: string): Promise<{ summary: string }> => {
  const response = await api.post(`/study-groups/${groupId}/ai/summary`);
  return response.data;
};

/**
 * AI Group Chat Assistant
 */
export const chatWithGroupAI = async (
  groupId: string, 
  message: string,
  replyToMessageId?: string
): Promise<{ answer: string }> => {
  const response = await api.post(`/study-groups/${groupId}/ai/chat`, { 
    message,
    replyToMessageId
  });
  return response.data;
};
