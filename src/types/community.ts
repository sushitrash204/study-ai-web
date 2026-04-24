import { StudyGroup } from './studyGroup';

export interface CommunityAuthor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface CommunitySubject {
  id: string;
  name: string;
  color?: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string | null;
  createdAt: string;
  updatedAt: string;
  author?: CommunityAuthor;
}

export interface CommunityPost {
  id: string;
  groupId: string;
  userId: string;
  subjectId?: string | null;
  content: string;
  imageUrl?: string | null;
  isPublic: boolean;
  likeCount: number;
  commentCount: number;
  likedUserIds: string[];
  createdAt: string;
  updatedAt: string;
  author?: CommunityAuthor;
  group?: Pick<StudyGroup, 'id' | 'name' | 'isPublic' | 'avatarUrl'>;
  subject?: CommunitySubject | null;
}

export interface CommunityPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface CommunityFeedResponse {
  data: CommunityPost[];
  pagination: CommunityPagination;
}

export interface CreateCommunityPostPayload {
  content: string;
  imageUrl?: string;
  subjectId?: string;
  isPublic?: boolean;
}
