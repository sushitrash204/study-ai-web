'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Share2,
  MessageSquare,
  LogOut,
  Loader2,
  Globe,
  Lock,
  Calendar,
  FileText,
  ChevronRight,
  Shield,
  Zap,
  Sparkles,
  Copy,
  Check,
  X,
  QrCode,
  UserPlus,
  ArrowUpRight,
  Settings,
  MoreVertical,
  Plus,
  BookOpen,
  ClipboardList,
  Search,
  MessageCircle,
  Trophy,
  Medal,
  TrendingUp,
   Heart,
   Send,
   Upload,
   Image as ImageIcon,
} from 'lucide-react';
import * as studyGroupService from '@/services/studyGroupService';
import * as communityService from '@/services/communityService';
import * as documentService from '@/services/documentService';
import { StudyGroup, GroupMember } from '@/services/studyGroupService';
import { CommunityPost } from '@/types/community';
import { Document as DocumentModel } from '@/models/Document';
import { useSubjects } from '@/hooks/subject/useSubjects';
import { useAuthStore } from '@/store/authStore';
import ShareResourceModal from '@/components/study-group/ShareResourceModal';
import GroupSettings from '@/components/study-group/GroupSettings';

export default function StudyGroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const { user: currentUser } = useAuthStore();

  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [tab, setTab] = useState<'info' | 'members' | 'posts' | 'requests' | 'resources' | 'management'>('info');
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  
  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCodeData, setInviteCodeData] = useState<any>(null);
  const [copying, setCopying] = useState(false);
  const [resourceUserFilter, setResourceUserFilter] = useState<string | null>(null);
  const [resourceTypeTab, setResourceTypeTab] = useState<'DOCUMENT' | 'EXERCISE'>('DOCUMENT');
  const [shareSubjectFilter, setShareSubjectFilter] = useState<string | null>(null);

  // Share Resource Modal
  const [showShareModal, setShowShareModal] = useState(false);

   // Group posts
   const [groupPosts, setGroupPosts] = useState<CommunityPost[]>([]);
   const [posting, setPosting] = useState(false);
   const [uploadingPostImage, setUploadingPostImage] = useState(false);
   const [postContent, setPostContent] = useState('');
   const [postImageUrl, setPostImageUrl] = useState('');
   const [postImageFile, setPostImageFile] = useState<File | null>(null);
   const [postImagePreview, setPostImagePreview] = useState<string>('');
   const [showComposer, setShowComposer] = useState(false);
   const [availableDocuments, setAvailableDocuments] = useState<DocumentModel[]>([]);
   const [selectedDocumentId, setSelectedDocumentId] = useState('');
   const [loadingDocuments, setLoadingDocuments] = useState(false);
   const [uploadingAttachmentDocument, setUploadingAttachmentDocument] = useState(false);
   const [selectedAttachmentSubjectId, setSelectedAttachmentSubjectId] = useState('');
   const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
   const [postComments, setPostComments] = useState<Record<string, any[]>>({});
   const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

   const { state: subjectState } = useSubjects({ type: 'PERSONAL', autoFetch: true });
   const subjectOptions = subjectState.subjects;
   const filteredAvailableDocuments = useMemo(() => {
      if (!selectedAttachmentSubjectId) return [];
      return availableDocuments.filter((doc) => String(doc.subjectId) === String(selectedAttachmentSubjectId));
   }, [availableDocuments, selectedAttachmentSubjectId]);

  const isMember = members.some(m => m.userId === currentUser?.id) || group?.ownerId === currentUser?.id;
  const isAdmin = group?.ownerId === currentUser?.id || 
                  members.find(m => m.userId === currentUser?.id)?.role === 'admin';

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

   const loadGroupPosts = async () => {
      try {
         const response = await communityService.getGroupPosts(groupId, { page: 1, limit: 20 });
         setGroupPosts(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
         console.error('Load group posts error:', error);
         setGroupPosts([]);
      }
   };


  const loadGroupData = async () => {
    try {
      setLoading(true);
      setErrorStatus(null);
      const groupData = await studyGroupService.getStudyGroupDetail(groupId);
      setGroup(groupData);
      
      const [membersList, resourcesList] = await Promise.all([
        studyGroupService.getGroupMembers(groupId).catch(() => []),
        studyGroupService.getSharedResources(groupId).catch(() => [])
      ]);

      setMembers(membersList);
      setResources(resourcesList);
      await loadGroupPosts();

      if (isAdmin || groupData.ownerId === currentUser?.id) {
         const requests = await studyGroupService.getPendingJoinRequests(groupId).catch(() => []);
         setPendingRequests(requests);
      }
    } catch (err: any) {
      setErrorStatus(err.response?.status || 500);
    } finally {
      setLoading(false);
    }
  };

  // Set default tab to posts once membership is confirmed
  useEffect(() => {
     if (isMember && tab === 'info') {
        setTab('posts');
     }
  }, [isMember]);

   const loadDocumentsForComposer = async () => {
      try {
         setLoadingDocuments(true);
         const docs = await documentService.getAllDocuments();
         const myDocuments = Array.isArray(docs)
            ? docs.filter((doc) => String(doc.userId) === String(currentUser?.id || '') && !doc.isSystem)
            : [];
         setAvailableDocuments(myDocuments);
      } catch (error) {
         console.error('Load documents for composer error:', error);
         setAvailableDocuments([]);
      } finally {
         setLoadingDocuments(false);
      }
   };

   const openComposer = async () => {
      setShowComposer(true);
      if (availableDocuments.length === 0) {
         await loadDocumentsForComposer();
      }
   };

   useEffect(() => {
      if (!selectedAttachmentSubjectId && selectedDocumentId) {
         setSelectedDocumentId('');
         return;
      }
      if (
         selectedDocumentId &&
         !availableDocuments.some(
            (doc) => doc.id === selectedDocumentId && String(doc.subjectId) === String(selectedAttachmentSubjectId)
         )
      ) {
         setSelectedDocumentId('');
      }
   }, [selectedAttachmentSubjectId, selectedDocumentId, availableDocuments]);

   const handleUploadAttachmentDocument = async (file: File) => {
      if (!selectedAttachmentSubjectId) {
         alert('Vui lòng chọn môn học trước khi tải tài liệu đính kèm.');
         return;
      }

      try {
         setUploadingAttachmentDocument(true);
         const created = await documentService.uploadDocument(file, selectedAttachmentSubjectId, file.name);
         setAvailableDocuments((prev) => {
            const withoutSame = prev.filter((doc) => doc.id !== created.id);
            return [created, ...withoutSame];
         });
         setSelectedDocumentId(created.id);
      } catch (error: any) {
         alert(error?.response?.data?.message || 'Không thể tải tài liệu từ máy tính.');
      } finally {
         setUploadingAttachmentDocument(false);
      }
   };


  const handleJoinGroup = async () => {
    try {
      setJoining(true);
      await studyGroupService.requestJoin(groupId);
      alert('Yêu cầu đã gửi! Đợi admin duyệt nhé.');
      await loadGroupData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi rồi');
    } finally {
      setJoining(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
     try {
        await studyGroupService.approveJoinRequest(groupId, requestId);
        await loadGroupData();
     } catch (error) { alert('Lỗi phê duyệt'); }
  };

  const handleRejectRequest = async (requestId: string) => {
     try {
        await studyGroupService.rejectJoinRequest(groupId, requestId);
        await loadGroupData();
     } catch (error) { alert('Lỗi từ chối'); }
  };

  const handleGetInviteCode = async () => {
    try {
      const inviteLink = await studyGroupService.getOrCreateInviteLink(groupId);
      setInviteCodeData(inviteLink);
      setShowInviteModal(true);
    } catch (error) { alert('Lỗi mã mời'); }
  };

  const handleCopyCode = () => {
    if (!inviteCodeData) return;
    setCopying(true);
    navigator.clipboard.writeText(inviteCodeData.inviteCode);
    setTimeout(() => setCopying(false), 2000);
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Bạn có chắc chắn muốn rời nhóm này?')) return;
    try {
      await studyGroupService.leaveGroup(groupId);
      router.push('/study-groups');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi khi rời nhóm');
    }
  };

   const handleSelectPostImage = (file: File) => {
      setPostImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPostImagePreview(previewUrl);
   };

   const handleToggleLike = async (postId: string) => {
      try {
         const result = await communityService.togglePostLike(postId);
         setGroupPosts(prev => prev.map(post => 
            post.id === postId 
               ? { ...post, likeCount: result.likeCount, likedUserIds: result.liked ? [...(post.likedUserIds || []), currentUser!.id] : (post.likedUserIds || []).filter(id => id !== currentUser!.id) }
               : post
         ));
      } catch (error) {
         console.error('Like error:', error);
      }
   };

   const loadComments = async (postId: string) => {
      try {
         const comments = await communityService.getPostComments(postId);
         setPostComments(prev => ({ ...prev, [postId]: comments }));
      } catch (error) {
         console.error('Load comments error:', error);
      }
   };

   const handleCreateComment = async (postId: string, content: string) => {
      if (!content?.trim()) return;
      try {
         const newComment = await communityService.createPostComment(postId, { content });
         setPostComments(prev => ({
            ...prev,
            [postId]: [...(prev[postId] || []), newComment]
         }));
         setCommentInputs(prev => ({ ...prev, [postId]: '' }));
         setGroupPosts(prev => prev.map(p => 
            p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p
         ));
      } catch (error) {
         console.error('Comment error:', error);
      }
   };

   const handleCreatePost = async () => {
      if (!isMember) {
         alert('Bạn cần là thành viên của nhóm để đăng bài.');
         return;
      }

      const selectedDocument = availableDocuments.find((doc) => doc.id === selectedDocumentId);
      if (!postContent.trim() && !postImageFile && !selectedDocument) {
         alert('Vui lòng nhập nội dung, chọn ảnh hoặc đính kèm tài liệu.');
         return;
      }

      try {
         setPosting(true);

         let finalImageUrl = '';
         if (postImageFile) {
            setUploadingPostImage(true);
            try {
               finalImageUrl = await communityService.uploadPostImage(postImageFile);
            } catch (uploadError) {
               alert('Lỗi khi tải ảnh lên máy chủ. Vui lòng thử lại.');
               setPosting(false);
               setUploadingPostImage(false);
               return;
            }
            setUploadingPostImage(false);
         }

         const attachmentLine = selectedDocument
            ? `\n\nTài liệu đính kèm: ${selectedDocument.title}\n${selectedDocument.fileUrl}`
            : '';
         
         await communityService.createGroupPost(groupId, {
            content: `${postContent.trim()}${attachmentLine}`.trim(),
            imageUrl: finalImageUrl || undefined,
         });

         setPostContent('');
         setPostImageUrl('');
         setPostImageFile(null);
         if (postImagePreview) URL.revokeObjectURL(postImagePreview);
         setPostImagePreview('');
         setSelectedDocumentId('');
         setShowComposer(false);
         await loadGroupPosts();
         setTab('posts');
         alert('Đăng bài thành công.');
      } catch (error: any) {
         alert(error?.response?.data?.message || 'Không thể đăng bài vào lúc này.');
      } finally {
         setPosting(false);
         setUploadingPostImage(false);
      }
   };

  const handleOpenResource = (resource: any) => {
    // 1. Security check: User must be a member or admin/owner
    if (!isMember) {
      alert("Bạn cần là thành viên của nhóm để truy cập tài nguyên này.");
      return;
    }

    // 2. Security check: Resource must belong to this specific group
    const resourceExistsInGroup = resources.some(r => r.id === resource.id);
    if (!resourceExistsInGroup) {
      alert("Tài nguyên này không khả dụng trong nhóm.");
      return;
    }

    // 3. Navigation
    if (resource.resourceType === 'DOCUMENT') {
      router.push(`/documents/${resource.resourceId}/view`);
    } else if (resource.resourceType === 'EXERCISE') {
      router.push(`/exercises/${resource.resourceId}`);
    }
  };

  const handleUnshareResource = async (sharedResourceId: string) => {
    if (!confirm('Bạn có chắc chắn muốn gỡ tài nguyên này khỏi nhóm?')) return;
    try {
      await studyGroupService.unshareResource(groupId, sharedResourceId);
      // Update local state
      setResources(prev => prev.filter(r => r.id !== sharedResourceId));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Lỗi khi gỡ tài nguyên');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 relative">
      {/* Mesh Background */}
      <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-indigo-50/50 to-transparent z-0"></div>

      <div className="max-w-[1100px] mx-auto px-6 pt-24 relative z-10">
        
        {/* Navigation */}
        <div className="mb-8">
           <button 
              onClick={() => router.push('/study-groups')}
              className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-all font-black text-[10px] uppercase tracking-widest group"
           >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              về danh sách
           </button>
        </div>

        {/* --- COMPACT HERO SECTION --- */}
        <div className="bg-white rounded-[32px] p-6 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white mb-10 overflow-hidden relative group">
           <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
              {/* Avatar Area */}
              <div className="shrink-0">
                 <div className="w-36 h-36 lg:w-40 lg:h-40 rounded-[30px] overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-700 p-0.5 shadow-xl">
                    <div className="w-full h-full rounded-[28px] overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center">
                       {group?.avatarUrl ? (
                         <img src={group.avatarUrl} alt={group.name} className="w-full h-full object-cover" />
                       ) : (
                         <Users size={56} className="text-white opacity-80" />
                       )}
                    </div>
                 </div>
              </div>

              {/* Group Info */}
              <div className="flex-1 text-center md:text-left space-y-5">
                 <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                       <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${group?.isPublic ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white'}`}>
                          {group?.isPublic ? 'Cộng đồng' : 'Riêng tư'}
                       </span>
                       <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-wider border border-indigo-100/50">
                          ⭐️ Hạng Vàng
                       </span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-none">
                       {group?.name}
                    </h1>
                    <p className="text-sm text-gray-400 font-bold max-w-xl opacity-80 italic">
                       &ldquo;{group?.description || 'Nơi những tâm hồn đồng điệu cùng chinh phục tri thức.'}&rdquo;
                    </p>
                 </div>

                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                    {isMember ? (
                       <>
                          <Link
                             href={`/study-groups/${groupId}/chat`}
                             className="flex items-center gap-2.5 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all text-[11px] uppercase tracking-widest"
                          >
                             <MessageSquare size={16} />
                             Vào phòng Chat
                          </Link>
                          <button
                             onClick={handleGetInviteCode}
                             className="flex items-center gap-2.5 px-6 py-3.5 bg-white text-gray-900 border border-gray-100 rounded-2xl font-black shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 text-[11px] uppercase tracking-widest"
                          >
                             <Share2 size={16} className="text-indigo-600" />
                             Mã mời
                          </button>
                          {group?.ownerId !== currentUser?.id && (
                             <button
                                onClick={handleLeaveGroup}
                                className="flex items-center gap-2.5 px-6 py-3.5 bg-white text-rose-500 border border-rose-50 rounded-2xl font-black shadow-sm hover:shadow-md hover:bg-rose-50 hover:-translate-y-0.5 transition-all active:scale-95 text-[11px] uppercase tracking-widest"
                             >
                                <LogOut size={16} />
                                Rời nhóm
                             </button>
                          )}
                       </>
                    ) : (
                       <button
                          onClick={handleJoinGroup}
                          disabled={joining}
                          className="flex items-center gap-4 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all disabled:opacity-50 text-xs uppercase tracking-widest"
                       >
                          {joining ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                          Gia nhập cộng đồng
                       </button>
                    )}
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           {/* Main Content Area */}
           <div className="lg:col-span-12 space-y-6">
              {/* Modern Glass Tabs */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-1.5 border border-white flex gap-1 shadow-sm">
                 {[
                    ...(isMember ? [{ id: 'posts', label: 'Bài đăng', icon: MessageSquare }] : []),
                    { id: 'members', label: 'Thành viên', icon: Users },
                    { id: 'info', label: 'Thông tin nhóm', icon: Shield },
                    { id: 'resources', label: 'Tài liệu', icon: Zap },
                    ...(isAdmin ? [{ id: 'requests', label: 'Duyệt', icon: UserPlus }] : []),
                    ...(isAdmin ? [{ id: 'management', label: 'Cài đặt', icon: Settings }] : [])
                 ].map((t) => (
                    <button
                       key={t.id}
                       onClick={() => setTab(t.id as any)}
                       className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          tab === t.id
                             ? 'bg-indigo-600 text-white shadow-md'
                             : 'text-gray-400 hover:text-gray-900 hover:bg-white'
                       }`}
                    >
                       <t.icon size={14} />
                       <span className="hidden sm:inline">{t.label}</span>
                    </button>
                 ))}
              </div>

              {/* Content Panel */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[400px]">
                  {/* Info Tab */}
                  {tab === 'info' && (
                     <div className="space-y-8 animate-in fade-in duration-500">
                        <section className="space-y-4">
                           <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                              <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                              Nội quy học tập
                           </h3>
                           <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                              <p className="text-gray-600 font-bold leading-relaxed whitespace-pre-wrap">
                                 {group?.rules || 'Nhóm hiện chưa cập nhật nội quy cụ thể.'}
                              </p>
                           </div>
                        </section>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex flex-col gap-1">
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Sáng lập</p>
                              <p className="text-sm font-black text-gray-900 truncate">
                                 {group?.owner ? `${group.owner.firstName} ${group.owner.lastName}` : 'Quản trị viên'}
                              </p>
                           </div>
                           <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex flex-col gap-1">
                              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Khởi tạo</p>
                              <p className="text-sm font-black text-gray-900">
                                 {group?.createdAt && new Date(group.createdAt).toLocaleDateString('vi-VN')}
                              </p>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Posts Tab */}
                  {tab === 'posts' && isMember && (
                     <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                           <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
                                 {currentUser?.firstName?.[0] || 'U'}
                              </div>
                              <button
                                 onClick={() => void openComposer()}
                                 className="flex-1 text-left px-4 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-semibold transition-all"
                              >
                                 Chia sẻ kiến thức, câu hỏi hoặc tài liệu cho nhóm...
                              </button>
                           </div>
                           <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                              <button
                                 onClick={() => void openComposer()}
                                 title="Tạo bài đăng"
                                 aria-label="Tạo bài đăng"
                                 className="w-11 h-11 inline-flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
                              >
                                 <FileText size={18} className="text-indigo-500" />
                              </button>
                              <button
                                 onClick={() => void openComposer()}
                                 title="Đính kèm ảnh"
                                 aria-label="Đính kèm ảnh"
                                 className="w-11 h-11 inline-flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
                              >
                                 <ImageIcon size={18} className="text-emerald-500" />
                              </button>
                              <button
                                 onClick={() => void openComposer()}
                                 title="Đính kèm tài liệu"
                                 aria-label="Đính kèm tài liệu"
                                 className="w-11 h-11 inline-flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
                              >
                                 <Upload size={18} className="text-orange-500" />
                              </button>
                           </div>
                        </div>

                        {groupPosts.length === 0 ? (
                           <div className="py-16 border-2 border-dashed border-gray-100 rounded-3xl text-center space-y-3">
                              <ImageIcon size={34} className="mx-auto text-gray-300" />
                              <p className="text-sm font-bold text-gray-500">Nhóm chưa có bài đăng nào.</p>
                           </div>
                        ) : (
                           <div className="space-y-4">
                              {groupPosts.map((post) => {
                                 const isLiked = Boolean(currentUser?.id && (post.likedUserIds || []).includes(currentUser.id));
                                 return (
                                    <div key={post.id} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
                                       <div className="flex items-start justify-between gap-4">
                                          <div className="flex items-center gap-3">
                                             <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
                                                {post.author?.firstName?.[0] || 'T'}
                                             </div>
                                             <div>
                                                <p className="text-sm font-black text-gray-900">{post.author?.firstName} {post.author?.lastName}</p>
                                                <p className="text-xs font-bold text-gray-400">{new Date(post.createdAt).toLocaleString('vi-VN')}</p>
                                             </div>
                                          </div>
                                          {post.subject?.name ? (
                                             <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">{post.subject.name}</span>
                                          ) : null}
                                       </div>

                                       {post.content ? <p className="text-sm font-medium text-gray-700 leading-relaxed">{post.content}</p> : null}
                                       {post.imageUrl ? (
                                          <img src={post.imageUrl} alt="group-post" className="w-full max-h-[420px] object-cover rounded-2xl border border-gray-100" />
                                       ) : null}

                                        {/* Instagram Style Interactions */}
                                        <div className="space-y-3 pt-4 border-t border-gray-50">
                                           <div className="flex items-center gap-4">
                                              <button 
                                                 onClick={() => handleToggleLike(post.id)}
                                                 className={`transform transition-all active:scale-125 ${isLiked ? 'text-rose-500' : 'text-gray-900 hover:text-gray-600'}`}
                                              >
                                                 <Heart size={26} className={isLiked ? 'fill-current' : ''} />
                                              </button>
                                              <button 
                                                 onClick={() => {
                                                    setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }));
                                                    if (!postComments[post.id]) loadComments(post.id);
                                                 }}
                                                 className="text-gray-900 hover:text-gray-600 transition-colors"
                                              >
                                                 <MessageCircle size={26} />
                                              </button>
                                              <button className="text-gray-900 hover:text-gray-600 transition-colors ml-auto">
                                                 <Share2 size={22} />
                                              </button>
                                           </div>

                                           <div className="space-y-1">
                                              <p className="text-sm font-black text-gray-900">
                                                 {post.likeCount || 0} lượt thích
                                              </p>
                                              <button 
                                                 onClick={() => {
                                                    setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }));
                                                    if (!postComments[post.id]) loadComments(post.id);
                                                 }}
                                                 className="text-[11px] font-bold text-gray-400 hover:underline block"
                                              >
                                                 Xem tất cả {post.commentCount || 0} bình luận
                                              </button>
                                           </div>

                                           {/* Expandable Comments Area */}
                                           {expandedComments[post.id] && (
                                              <div className="pt-3 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                                 <div className="space-y-3 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                                                    {(postComments[post.id] || []).map((comment) => (
                                                       <div key={comment.id} className="flex gap-2">
                                                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black shrink-0 text-indigo-600">
                                                             {comment.author?.firstName?.[0]}
                                                          </div>
                                                          <div className="flex-1 bg-gray-50 p-2 rounded-xl">
                                                             <p className="text-[11px] font-black text-gray-900 mb-0.5">
                                                                {comment.author?.firstName} {comment.author?.lastName}
                                                             </p>
                                                             <p className="text-xs font-medium text-gray-700 leading-tight">{comment.content}</p>
                                                          </div>
                                                       </div>
                                                    ))}
                                                 </div>
                                                 
                                                 <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                                                    <input 
                                                       type="text"
                                                       placeholder="Thêm bình luận..."
                                                       value={commentInputs[post.id] || ''}
                                                       onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                       onKeyDown={(e) => e.key === 'Enter' && handleCreateComment(post.id, commentInputs[post.id])}
                                                       className="flex-1 text-xs font-medium outline-none bg-transparent placeholder:text-gray-400"
                                                    />
                                                    <button 
                                                       onClick={() => handleCreateComment(post.id, commentInputs[post.id])}
                                                       disabled={!commentInputs[post.id]?.trim()}
                                                       className="text-indigo-600 font-black text-[10px] uppercase tracking-widest disabled:opacity-30"
                                                    >
                                                       Đăng
                                                    </button>
                                                 </div>
                                              </div>
                                           )}
                                        </div>
                                    </div>
                                 );
                              })}
                           </div>
                        )}
                     </div>
                  )}

                  {/* Members Tab */}
                  {tab === 'members' && (
                     <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Quick Stats Integration */}
                        <div className="flex flex-wrap gap-4">
                           <div className="flex-1 min-w-[200px] p-6 bg-gradient-to-br from-indigo-50/50 to-white rounded-[24px] border border-indigo-100/50 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                              <div>
                                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Tổng thành viên</p>
                                 <p className="text-3xl font-black text-gray-900">{members.length}</p>
                              </div>
                              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                                 <Users size={24} />
                              </div>
                           </div>

                           {isAdmin && (
                              <button 
                                 onClick={() => setTab('requests')}
                                 disabled={pendingRequests.length === 0}
                                 className={`flex-1 min-w-[200px] p-6 rounded-[24px] border shadow-sm flex items-center justify-between group transition-all text-left ${
                                    pendingRequests.length > 0 
                                       ? 'bg-gradient-to-br from-amber-50/50 to-white border-amber-200/50 hover:shadow-md hover:-translate-y-0.5 animate-pulse' 
                                       : 'bg-gray-50/30 border-gray-100 opacity-60 cursor-default'
                                 }`}
                              >
                                 <div>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${pendingRequests.length > 0 ? 'text-amber-600' : 'text-gray-400'}`}>Đang chờ duyệt</p>
                                    <p className="text-3xl font-black text-gray-900">{pendingRequests.length}</p>
                                 </div>
                                 <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm transition-transform ${pendingRequests.length > 0 ? 'text-amber-600 group-hover:scale-110' : 'text-gray-300'}`}>
                                    <UserPlus size={24} />
                                 </div>
                              </button>
                           )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                           {members.map((member) => (
                              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-indigo-100 rounded-2xl transition-all group">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-indigo-600 font-black shadow-sm group-hover:scale-110 transition-transform">
                                       {member.user?.firstName?.[0]}
                                    </div>
                                    <div>
                                       <p className="font-black text-gray-900 text-sm tracking-tight">{member.user?.firstName} {member.user?.lastName}</p>
                                       <p className={`text-[9px] font-black uppercase tracking-widest ${member.role === 'admin' ? 'text-indigo-600' : 'text-gray-400'}`}>
                                          {member.role === 'admin' ? 'Admin' : 'Thành viên'}
                                       </p>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* Requests Tab */}
                  {tab === 'requests' && isAdmin && (
                     <div className="space-y-4 animate-in fade-in duration-500">
                        {pendingRequests.length > 0 ? pendingRequests.map((req) => (
                           <div key={req.id} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-indigo-200 transition-all shadow-sm">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-lg">
                                    {req.user?.firstName?.[0]}
                                 </div>
                                 <div>
                                    <p className="font-black text-gray-900">{req.user?.firstName} {req.user?.lastName}</p>
                                    <p className="text-[10px] font-bold text-gray-400">Đăng ký ngày • {new Date(req.createdAt).toLocaleDateString()}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <button onClick={() => handleRejectRequest(req.id)} className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><X size={18} /></button>
                                 <button onClick={() => handleApproveRequest(req.id)} className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"><Check size={18} /></button>
                              </div>
                           </div>
                        )) : (
                           <div className="py-20 text-center text-gray-300 font-black uppercase tracking-widest text-xs">Phòng chờ trống</div>
                        )}
                     </div>
                  )}

                  {/* Resources Tab */}
                  {tab === 'resources' && (
                     <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between">
                           <h3 className="text-lg font-black text-gray-900">Kho lưu trữ chung</h3>
                           {isMember && (
                              <button 
                                 onClick={() => setShowShareModal(true)}
                                 className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                              >
                                 <Plus size={14} />
                                 Chia sẻ ngay
                              </button>
                           )}
                        </div>

                        {isMember && (
                           <>
                              {/* Content Type Sub-tabs */}
                              <div className="flex border-b border-gray-100 mb-6 pb-0 overflow-x-auto no-scrollbar">
                                 <button
                                    onClick={() => setResourceTypeTab('DOCUMENT')}
                                    className={`px-6 py-4 font-black text-[11px] uppercase tracking-[0.2em] relative transition-all ${
                                       resourceTypeTab === 'DOCUMENT' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                 >
                                    Tài liệu
                                    {resourceTypeTab === 'DOCUMENT' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
                                 </button>
                                 <button
                                    onClick={() => setResourceTypeTab('EXERCISE')}
                                    className={`px-6 py-4 font-black text-[11px] uppercase tracking-[0.2em] relative transition-all ${
                                       resourceTypeTab === 'EXERCISE' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                 >
                                    Bài tập
                                    {resourceTypeTab === 'EXERCISE' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
                                 </button>
                              </div>

                              {/* Contributor Filter Bar */}
                              <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
                                 <button 
                                    onClick={() => setResourceUserFilter(null)}
                                    className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                       !resourceUserFilter 
                                          ? 'bg-gray-900 text-white shadow-md' 
                                          : 'bg-white text-gray-400 border border-gray-100 hover:text-gray-900'
                                    }`}
                                 >
                                    Tất cả người gửi
                                 </button>
                                 {Array.from(new Set(
                                    resources
                                       .filter(r => r.resourceType === resourceTypeTab)
                                       .map(r => r.sharedByUser ? `${r.sharedByUser.firstName} ${r.sharedByUser.lastName}` : null)
                                       .filter(Boolean)
                                 )).map(userName => (
                                    <button 
                                       key={userName as string}
                                       onClick={() => setResourceUserFilter(userName as string)}
                                       className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                          resourceUserFilter === userName
                                             ? 'bg-gray-900 text-white shadow-md' 
                                             : 'bg-white text-gray-400 border border-gray-100 hover:text-gray-900'
                                       }`}
                                    >
                                       {userName as string}
                                    </button>
                                 ))}
                              </div>

                              {resources.filter(r => r.resourceType === resourceTypeTab).length === 0 ? (
                                 <div className="py-24 text-center space-y-4 border-2 border-dashed border-gray-50 rounded-3xl">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                                       <BookOpen size={32} />
                                    </div>
                                    <p className="text-gray-400 font-bold text-sm">Chưa có {resourceTypeTab === 'DOCUMENT' ? 'tài liệu' : 'bài tập'} nào được chia sẻ.</p>
                                    <button 
                                       onClick={() => setShowShareModal(true)}
                                       className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                                    >
                                       Bắt đầu chia sẻ đầu tiên
                                    </button>
                                 </div>
                              ) : (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {resources
                                       .filter(r => r.resourceType === resourceTypeTab)
                                       .filter(r => !resourceUserFilter || `${r.sharedByUser?.firstName} ${r.sharedByUser?.lastName}` === resourceUserFilter)
                                       .map((resource: any) => (
                                       <div 
                                          key={resource.id} 
                                          className="p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-lg transition-all duration-300 group cursor-pointer relative"
                                       >
                                          <div className="flex items-center gap-4">
                                             {/* Modern Icon Box */}
                                             <div 
                                                onClick={() => handleOpenResource(resource)}
                                                className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-indigo-600 border border-gray-100 shadow-sm group-hover:scale-105 transition-transform shrink-0"
                                             >
                                                {resource.resourceType === 'DOCUMENT' ? <FileText size={20} /> : <ClipboardList size={20} />}
                                             </div>

                                             {/* Content Area */}
                                             <div className="min-w-0 flex-1 py-1" onClick={() => handleOpenResource(resource)}>
                                                <h4 className="font-black text-gray-900 text-sm truncate tracking-tight mb-0.5">
                                                   {resource.resource?.title}
                                                </h4>
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                   <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-500 rounded-md text-[8px] font-black uppercase tracking-widest shrink-0">
                                                      {resource.resource?.subject?.name || 'Chung'}
                                                   </span>
                                                   <span className="text-[9px] font-bold text-gray-400 truncate uppercase tracking-tighter">
                                                      • {resource.sharedByUser ? `${resource.sharedByUser.firstName}` : 'Hệ thống'}
                                                   </span>
                                                </div>
                                             </div>

                                             {/* Sleek Action Menu */}
                                             {(resource.sharedBy === currentUser?.id || isAdmin) && (
                                               <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                                                  <button 
                                                    onClick={(e) => {
                                                      const btn = e.currentTarget;
                                                      const menu = btn.nextElementSibling as HTMLElement;
                                                      menu.classList.toggle('hidden');
                                                    }}
                                                    className="p-2 text-gray-300 hover:text-indigo-600 transition-colors"
                                                  >
                                                     <MoreVertical size={16} />
                                                  </button>
                                                  <div className="hidden absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-gray-100 z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                     <button 
                                                       onClick={() => handleUnshareResource(resource.id)}
                                                       className="w-full px-4 py-2.5 text-left text-red-500 font-black text-[9px] uppercase tracking-widest hover:bg-red-50 transition-colors flex items-center gap-2"
                                                     >
                                                       <X size={12} />
                                                       Gỡ tài nguyên
                                                     </button>
                                                  </div>
                                               </div>
                                             )}
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              )}
                           </>
                        )}
                     </div>
                  )}

                  {/* Management Tab */}
                  {tab === 'management' && isAdmin && group && (
                     <GroupSettings 
                        group={group} 
                        onUpdate={loadGroupData} 
                     />
                  )}

                  {/* Lock Screen for Non-members */}
                  {!isMember && (
                     <div className="py-20 text-center space-y-4 opacity-40">
                        <Lock size={40} className="mx-auto text-gray-400" />
                        <p className="text-gray-900 font-black text-sm uppercase tracking-widest">Nội dung bị khóa</p>
                     </div>
                  )}
               </div>
           </div>
            </div>


        <ShareResourceModal 
           isOpen={showShareModal}
           onClose={() => setShowShareModal(false)}
           groupId={groupId}
           existingResources={resources}
           onSuccess={loadGroupData}
        />

         {showComposer && isMember && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowComposer(false)}></div>
               <div className="relative w-full max-w-[500px] bg-white rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                     <div className="w-8"></div>
                     <h3 className="text-base font-black text-gray-900">Tạo bài viết</h3>
                     <button onClick={() => setShowComposer(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                        <X size={18} />
                     </button>
                  </div>

                  {/* Body - Scrollable */}
                  <div className="flex-1 overflow-y-auto max-h-[70vh] p-4 space-y-4 no-scrollbar">
                     {/* User Header */}
                     <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
                           {currentUser?.firstName?.[0] || 'U'}
                        </div>
                        <div>
                           <p className="text-sm font-black text-gray-900 leading-none mb-1">{currentUser?.firstName} {currentUser?.lastName}</p>
                           <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-md text-[9px] font-black uppercase tracking-widest text-gray-500 w-fit">
                              <Globe size={10} />
                              Công khai
                           </div>
                        </div>
                     </div>

                     {/* Content Area */}
                     <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder={`${currentUser?.firstName} ơi, bạn đang nghĩ gì thế?`}
                        className="w-full px-2 py-2 text-lg font-medium text-gray-800 placeholder:text-gray-400 outline-none resize-none min-h-[120px]"
                        autoFocus
                     />

                     {/* Image Preview Box - FB Thumbnail Style */}
                     {postImagePreview && (
                        <div className="px-2">
                           <div className="relative w-32 h-32 rounded-xl border-2 border-gray-100 overflow-hidden bg-gray-50 group shadow-sm">
                              <img src={postImagePreview} alt="preview" className="w-full h-full object-cover" />
                              <button 
                                 onClick={() => {
                                    setPostImageFile(null);
                                    URL.revokeObjectURL(postImagePreview);
                                    setPostImagePreview('');
                                 }}
                                 className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-all z-10"
                              >
                                 <X size={12} />
                              </button>
                           </div>
                        </div>
                     )}

                     {/* Attachments Sections */}
                     <div className="space-y-3 px-2">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Chủ đề & Môn học</label>
                           <select
                              value={selectedAttachmentSubjectId}
                              onChange={(e) => setSelectedAttachmentSubjectId(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 font-bold text-xs text-gray-700 outline-none focus:border-indigo-200 transition-all"
                           >
                              <option value="">Chọn môn học đính kèm...</option>
                              {subjectOptions.map((subject) => (
                                 <option key={subject.id} value={subject.id}>{subject.name}</option>
                              ))}
                           </select>
                        </div>

                        {selectedAttachmentSubjectId && (
                           <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Đính kèm tài liệu sẵn có</label>
                              <select
                                 value={selectedDocumentId}
                                 onChange={(e) => setSelectedDocumentId(e.target.value)}
                                 className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 font-bold text-xs text-gray-700 outline-none focus:border-indigo-200 transition-all"
                              >
                                 <option value="">{loadingDocuments ? 'Đang tải tài liệu...' : 'Chọn tài liệu từ thư viện...'}</option>
                                 {filteredAvailableDocuments.map((doc) => (
                                    <option key={doc.id} value={doc.id}>{doc.title}</option>
                                 ))}
                              </select>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Footer - Tools & Submit */}
                  <div className="p-4 space-y-4 bg-white border-t border-gray-50">
                     <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 shadow-sm">
                        <span className="text-[11px] font-black text-gray-600 ml-2">Thêm vào bài viết của bạn</span>
                        <div className="flex items-center gap-1">
                           <label className="w-9 h-9 flex items-center justify-center rounded-full text-emerald-500 hover:bg-emerald-50 cursor-pointer transition-colors relative">
                              <ImageIcon size={20} />
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleSelectPostImage(e.target.files[0])} />
                           </label>
                           <label className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${selectedAttachmentSubjectId ? 'text-indigo-500 hover:bg-indigo-50 cursor-pointer' : 'text-gray-200 cursor-not-allowed'}`}>
                              <Upload size={20} />
                              <input type="file" disabled={!selectedAttachmentSubjectId} accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => e.target.files?.[0] && handleUploadAttachmentDocument(e.target.files[0])} />
                           </label>
                           <button className="w-9 h-9 flex items-center justify-center rounded-full text-orange-500 hover:bg-orange-50 transition-colors">
                              <Sparkles size={20} />
                           </button>
                        </div>
                     </div>

                     <button
                        onClick={handleCreatePost}
                        disabled={posting || uploadingPostImage || (!postContent.trim() && !postImageFile)}
                        className="w-full py-3 bg-indigo-600 disabled:bg-gray-200 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
                     >
                        {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {posting ? 'Đang đăng...' : 'Đăng bài'}
                     </button>
                  </div>
               </div>
            </div>
         )}

        {/* Invite Modal */}
        {showInviteModal && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowInviteModal(false)}></div>
              <div className="relative bg-white w-full max-w-sm rounded-[40px] p-10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white text-center">
                 <div className="mb-8">
                    <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl mb-4">
                       <QrCode size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Mã mời học</h3>
                 </div>
                 
                 <div className="relative group mb-8">
                    <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-6 flex items-center justify-between group-hover:bg-white transition-all">
                       <span className="text-3xl font-black tracking-[0.3em] text-gray-900 ml-4">
                          {inviteCodeData?.inviteCode}
                       </span>
                       <button onClick={handleCopyCode} className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${copying ? 'bg-emerald-500 text-white' : 'bg-white text-indigo-600 hover:scale-105 active:scale-95'}`}>
                          {copying ? <Check size={20} /> : <Copy size={20} />}
                       </button>
                    </div>
                 </div>

                 <button onClick={() => setShowInviteModal(false)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                    Đóng lại
                 </button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
