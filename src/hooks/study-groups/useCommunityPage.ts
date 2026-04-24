import { useCallback, useEffect, useMemo, useState } from 'react';
import * as studyGroupService from '@/services/studyGroupService';
import * as communityService from '@/services/communityService';
import { CommunityComment, CommunityPost } from '@/types/community';
import { useSubjects } from '@/hooks/subject/useSubjects';
import { useAuthStore } from '@/store/authStore';

export type CommunityTab = 'my-groups' | 'discover';

export const useCommunityPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<CommunityTab>('my-groups');
  const [loading, setLoading] = useState(true);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [publicGroups, setPublicGroups] = useState<any[]>([]);
  const [feedPosts, setFeedPosts] = useState<CommunityPost[]>([]);
  const [postComments, setPostComments] = useState<Record<string, CommunityComment[]>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [postGroupId, setPostGroupId] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');

  const { state: subjectState } = useSubjects({ type: 'BOTH', autoFetch: true });
  const availableSubjects = useMemo(
    () => [...subjectState.subjects, ...subjectState.systemSubjects],
    [subjectState.subjects, subjectState.systemSubjects]
  );

  const loadMyGroups = useCallback(async () => {
    const groups = await studyGroupService.getUserStudyGroups();
    setMyGroups(groups);
    if (!postGroupId && groups.length > 0) {
      setPostGroupId(groups[0].id);
    }
  }, [postGroupId]);

  const loadPublicGroups = useCallback(async () => {
    const response = await studyGroupService.listStudyGroups(1, 24);
    setPublicGroups(Array.isArray(response.groups) ? response.groups : []);
  }, []);

  const loadDiscoveryFeed = useCallback(async () => {
    const response = await communityService.getDiscoveryFeed({
      page: 1,
      limit: 20,
      subjectId: selectedSubjectId || undefined,
    });

    setFeedPosts(Array.isArray(response.data) ? response.data : []);
  }, [selectedSubjectId]);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([loadMyGroups(), loadPublicGroups(), loadDiscoveryFeed()]);
    } catch (error) {
      console.error('Load community data error:', error);
    } finally {
      setLoading(false);
    }
  }, [loadDiscoveryFeed, loadMyGroups, loadPublicGroups]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const filteredMyGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return myGroups;

    return myGroups.filter((group) => {
      const name = String(group.name || '').toLowerCase();
      const description = String(group.description || '').toLowerCase();
      return name.includes(q) || description.includes(q);
    });
  }, [myGroups, searchQuery]);

  const filteredFeedPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return feedPosts;

    return feedPosts.filter((post) => {
      const content = String(post.content || '').toLowerCase();
      const groupName = String(post.group?.name || '').toLowerCase();
      const subjectName = String(post.subject?.name || '').toLowerCase();
      return content.includes(q) || groupName.includes(q) || subjectName.includes(q);
    });
  }, [feedPosts, searchQuery]);

  const suggestedGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const myGroupIdSet = new Set(myGroups.map((group) => String(group.id)));
    const notJoinedGroups = publicGroups.filter((group) => !myGroupIdSet.has(String(group.id)));

    if (!q) return notJoinedGroups;

    return notJoinedGroups.filter((group) => {
      const name = String(group.name || '').toLowerCase();
      const description = String(group.description || '').toLowerCase();
      return name.includes(q) || description.includes(q);
    });
  }, [myGroups, publicGroups, searchQuery]);

  const handleUploadPostImage = useCallback(async (file: File) => {
    try {
      setUploadingImage(true);
      const imageUrl = await communityService.uploadPostImage(file);
      if (imageUrl) {
        setPostImageUrl(imageUrl);
      }
    } catch (error) {
      console.error('Upload post image error:', error);
      alert('Không thể tải ảnh lên lúc này.');
    } finally {
      setUploadingImage(false);
    }
  }, []);

  const handleCreatePost = useCallback(async () => {
    if (!postGroupId) {
      alert('Vui lòng chọn nhóm để đăng bài.');
      return false;
    }

    if (!postContent.trim() && !postImageUrl.trim()) {
      alert('Vui lòng nhập nội dung hoặc chọn ảnh cho bài đăng.');
      return false;
    }

    try {
      setSubmittingPost(true);
      await communityService.createGroupPost(postGroupId, {
        content: postContent.trim(),
        imageUrl: postImageUrl.trim() || undefined,
        subjectId: selectedSubjectId || undefined,
      });

      setPostContent('');
      setPostImageUrl('');
      await loadDiscoveryFeed();
      setActiveTab('discover');
      return true;
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Không thể đăng bài vào lúc này.');
      return false;
    } finally {
      setSubmittingPost(false);
    }
  }, [postGroupId, postContent, postImageUrl, selectedSubjectId, loadDiscoveryFeed]);

  const handleToggleLike = useCallback(async (postId: string) => {
    try {
      const result = await communityService.togglePostLike(postId);
      const currentUserId = String(user?.id || '');
      setFeedPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likeCount: result.likeCount,
                likedUserIds: currentUserId
                  ? result.liked
                    ? Array.from(new Set([...(post.likedUserIds || []), currentUserId]))
                    : (post.likedUserIds || []).filter((id) => id !== currentUserId)
                  : post.likedUserIds,
              }
            : post
        )
      );
    } catch (error) {
      console.error('Toggle like error:', error);
    }
  }, [user?.id]);

  const loadComments = useCallback(async (postId: string) => {
    try {
      const comments = await communityService.getPostComments(postId);
      setPostComments((prev) => ({ ...prev, [postId]: comments }));
    } catch (error) {
      console.error('Load comments error:', error);
    }
  }, []);

  const handleCreateComment = useCallback(async (postId: string, content: string) => {
    const normalized = content.trim();
    if (!normalized) {
      return false;
    }

    try {
      const created = await communityService.createPostComment(postId, { content: normalized });
      setPostComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), created],
      }));
      setFeedPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, commentCount: Number(post.commentCount || 0) + 1 }
            : post
        )
      );
      return true;
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Không thể thêm bình luận.');
      return false;
    }
  }, []);

  return {
    state: {
      loading,
      submittingPost,
      uploadingImage,
      activeTab,
      myGroups,
      suggestedGroups,
      feedPosts: filteredFeedPosts,
      filteredMyGroups,
      postComments,
      searchQuery,
      selectedSubjectId,
      availableSubjects,
      postGroupId,
      postContent,
      postImageUrl,
    },
    actions: {
      setActiveTab,
      setSearchQuery,
      setSelectedSubjectId,
      setPostGroupId,
      setPostContent,
      setPostImageUrl,
      loadInitialData,
      loadPublicGroups,
      loadDiscoveryFeed,
      handleUploadPostImage,
      handleCreatePost,
      handleToggleLike,
      loadComments,
      handleCreateComment,
    },
  };
};
