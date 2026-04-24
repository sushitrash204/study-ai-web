'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Users,
  Search,
  Globe,
  Image as ImageIcon,
  ArrowUpRight,
  Loader2,
  Heart,
  MessageCircle,
  Send,
} from 'lucide-react';
import * as studyGroupService from '@/services/studyGroupService';
import { useCommunityPage } from '@/hooks/study-groups/useCommunityPage';
import { useAuthStore } from '@/store/authStore';
import { StudyGroup } from '@/types/studyGroup';

export default function StudyGroupsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { state, actions } = useCommunityPage();

  const [inviteCode, setInviteCode] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const handleJoinWithCode = async () => {
    if (!inviteCode.trim()) return;
    try {
      const response = await studyGroupService.joinByCode(inviteCode);
      alert(response.message || 'Thao tác thành công!');
      setShowInviteModal(false);
      setInviteCode('');
      await actions.loadInitialData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể sử dụng mã mời này');
    }
  };

  const selectedSubjectName = useMemo(() => {
    if (!state.selectedSubjectId) return 'Tất cả môn học';
    return state.availableSubjects.find((subject) => subject.id === state.selectedSubjectId)?.name || 'Tất cả môn học';
  }, [state.availableSubjects, state.selectedSubjectId]);

  const handleJoinSuggestedGroup = async (groupId: string) => {
    try {
      const response = await studyGroupService.requestJoinGroup(groupId);
      alert(response?.message || 'Đã gửi yêu cầu tham gia nhóm.');
      await actions.loadInitialData();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Không thể tham gia nhóm vào lúc này.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-24 relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-50 to-transparent z-0 opacity-70"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/20 rounded-full blur-[120px] z-0"></div>

      <div className="relative z-10 p-4 md:p-8 pt-20">
        <header className="max-w-[1100px] mx-auto mb-10 text-center">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                <Users size={20} className="text-indigo-600" />
              </div>
              <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.25em]">Cộng đồng tri thức</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">Cộng đồng</h1>
            <p className="text-gray-500 font-bold text-base max-w-xl mx-auto opacity-70">
              Quản lý nhóm của bạn và khám phá luồng thảo luận công khai từ toàn hệ thống.
            </p>
          </div>
        </header>

        <div className="max-w-[1100px] mx-auto mb-8 space-y-4">
          <div className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Tìm nhóm, bài đăng, môn học..."
              value={state.searchQuery}
              onChange={(e) => actions.setSearchQuery(e.target.value)}
              className="w-full bg-white/70 backdrop-blur-xl border border-white focus:border-indigo-100 px-12 py-3.5 rounded-2xl outline-none font-bold text-gray-900 shadow-sm transition-all placeholder:text-gray-400 text-sm"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/50 backdrop-blur-xl p-2 rounded-3xl border border-white shadow-sm">
            <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-[20px] w-full md:w-auto">
              <button
                onClick={() => actions.setActiveTab('my-groups')}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-[16px] text-[10px] font-black uppercase tracking-wider transition-all ${
                  state.activeTab === 'my-groups' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                Nhóm của tôi • {state.myGroups.length}
              </button>
              <button
                onClick={() => actions.setActiveTab('discover')}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-[16px] text-[10px] font-black uppercase tracking-wider transition-all ${
                  state.activeTab === 'discover' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                Khám phá • {state.feedPosts.length}
              </button>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-100 text-gray-900 rounded-2xl font-black hover:shadow-md transition-all text-[10px] uppercase tracking-widest"
              >
                <Users size={16} className="text-indigo-600" />
                Vào mã mời
              </button>
              <button
                onClick={() => router.push('/study-groups/create')}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all text-[10px] uppercase tracking-widest"
              >
                <Plus size={16} strokeWidth={3} />
                Tạo cộng đồng
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
          {state.loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đang kết nối cộng đồng...</p>
            </div>
          ) : state.activeTab === 'my-groups' ? (
            <>
              {state.filteredMyGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100 animate-in fade-in duration-500">
                  <div className="w-20 h-20 bg-indigo-50 rounded-[32px] flex items-center justify-center mb-6">
                    <Search size={40} className="text-indigo-300" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Chưa có nhóm phù hợp</h3>
                  <p className="text-gray-500 font-bold text-center max-w-sm mb-8 px-6">
                    Hãy tham gia hoặc tạo nhóm mới để bắt đầu hành trình học tập cộng đồng.
                  </p>
                  <button
                    onClick={() => router.push('/study-groups/create')}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 text-xs uppercase tracking-widest"
                  >
                    Tạo nhóm ngay
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                  {state.filteredMyGroups.map((group: StudyGroup) => (
                    <Link key={group.id} href={`/study-groups/${group.id}`} className="group">
                      <div className="h-full bg-white rounded-3xl border border-white shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-pointer relative flex flex-col">
                        <div className="relative h-40 overflow-hidden">
                          {group.avatarUrl ? (
                            <img
                              src={group.avatarUrl}
                              alt={group.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800" />
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-between p-5">
                            <div className="flex items-center justify-between">
                              <div className="px-2 py-0.5 bg-white/10 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-wider text-white border border-white/5">
                                {group.isPublic ? 'PUBLIC' : 'PRIVATE'}
                              </div>
                              <div className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                                <Globe size={12} />
                              </div>
                            </div>
                            <div className="space-y-0.5">
                              <h3 className="font-black text-white text-lg truncate leading-tight">{group.name}</h3>
                              <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">ID • {group.id.substring(0, 8)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                          <p className="text-xs text-gray-500 font-bold line-clamp-2 leading-relaxed opacity-70 italic">
                            {group.description ? `“${group.description}”` : 'Chưa có mô tả cho nhóm này.'}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-2">
                              <Users size={14} className="text-indigo-600 opacity-50" />
                              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{group.GroupMembers?.length || 0} Thành viên</span>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-gray-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-12 shadow-sm">
                              <ArrowUpRight size={16} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="bg-white rounded-[32px] border border-white shadow-sm p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Nhóm gợi ý cho bạn</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{state.suggestedGroups.length} nhóm</span>
                </div>

                {state.suggestedGroups.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
                    <p className="text-sm font-bold text-gray-500">Hiện chưa có nhóm gợi ý mới cho bạn.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto pb-1">
                    <div className="flex gap-4 min-w-max pr-2">
                      {state.suggestedGroups.map((group: StudyGroup) => (
                        <div key={group.id} className="w-[300px] bg-[#F8FAFF] border border-[#E4E8FF] rounded-2xl p-4 flex flex-col gap-4">
                          <div className="flex items-start gap-3">
                            <img
                              src={group.avatarUrl || 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=300'}
                              alt={group.name}
                              className="w-12 h-12 rounded-xl object-cover border border-white"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-gray-900 truncate">{group.name}</p>
                              <p className="text-xs font-semibold text-gray-500 line-clamp-2 mt-1">{group.description || 'Nhóm học tập công khai'}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <Link
                              href={`/study-groups/${group.id}`}
                              className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-white border border-gray-200 text-[10px] font-black uppercase tracking-wider text-gray-700 hover:border-indigo-200 hover:text-indigo-600"
                            >
                              Xem nhóm
                            </Link>
                            <button
                              onClick={() => void handleJoinSuggestedGroup(group.id)}
                              className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-indigo-600 text-[10px] font-black uppercase tracking-wider text-white hover:bg-indigo-700"
                            >
                              Tham gia
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[32px] border border-white shadow-sm p-5 md:p-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Bài viết mới nhất từ cộng đồng</h3>
                </div>
              </div>

              {state.feedPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[32px] border border-dashed border-gray-100">
                  <ImageIcon size={38} className="text-gray-300 mb-3" />
                  <p className="text-sm font-bold text-gray-500">Chưa có bài đăng công khai nào trong mục khám phá.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.feedPosts.map((post) => {
                    const isLikedByMe = Boolean(user?.id && (post.likedUserIds || []).includes(user.id));
                    const commentsForPost = state.postComments[post.id] || [];

                    return (
                      <div key={post.id} className="bg-white rounded-[28px] border border-white shadow-sm p-5 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-black text-gray-900">
                              {post.author?.firstName} {post.author?.lastName}
                            </p>
                            <p className="text-xs font-bold text-gray-400">
                              {post.group?.name} • {new Date(post.createdAt).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>

                        {post.content ? <p className="text-sm font-medium text-gray-700 leading-relaxed">{post.content}</p> : null}
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt="post-image"
                            className="w-full max-h-[420px] object-cover rounded-2xl border border-gray-100"
                          />
                        ) : null}

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => void actions.handleToggleLike(post.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                              isLikedByMe ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-500 hover:text-indigo-600'
                            }`}
                          >
                            <Heart size={14} /> {post.likeCount}
                          </button>
                          <button
                            onClick={() => {
                              setExpandedComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }));
                              if (!state.postComments[post.id]) {
                                void actions.loadComments(post.id);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 text-xs font-black uppercase tracking-wider text-gray-500 hover:text-indigo-600"
                          >
                            <MessageCircle size={14} /> {post.commentCount}
                          </button>
                        </div>

                        {expandedComments[post.id] ? (
                          <div className="space-y-3 border-t border-gray-100 pt-4">
                            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                              {commentsForPost.length === 0 ? (
                                <p className="text-xs font-medium text-gray-400">Chưa có bình luận nào.</p>
                              ) : (
                                commentsForPost.map((comment) => (
                                  <div key={comment.id} className="bg-gray-50 rounded-xl px-3 py-2">
                                    <p className="text-[11px] font-black text-gray-900">
                                      {comment.author?.firstName} {comment.author?.lastName}
                                    </p>
                                    <p className="text-xs font-medium text-gray-600">{comment.content}</p>
                                  </div>
                                ))
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                value={commentInputs[post.id] || ''}
                                onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                placeholder="Viết bình luận..."
                                className="flex-1 px-3 py-2 rounded-xl border border-gray-100 bg-[#F9FAFB] text-sm font-medium"
                              />
                              <button
                                onClick={async () => {
                                  const success = await actions.handleCreateComment(post.id, commentInputs[post.id] || '');
                                  if (success) {
                                    setCommentInputs((prev) => ({ ...prev, [post.id]: '' }));
                                  }
                                }}
                                className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                              >
                                <Send size={14} />
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-white">
            <div className="text-center space-y-4 mb-8">
              <div className="w-16 h-16 bg-indigo-50 rounded-[20px] flex items-center justify-center mx-auto text-indigo-600">
                <Users size={32} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Vào nhóm học</h2>
              <p className="text-gray-500 font-medium text-sm">Nhập mã mời được chủ nhóm cung cấp để tham gia ngay.</p>
            </div>

            <input
              type="text"
              placeholder="MÃ MỜI (8 KÝ TỰ)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 focus:border-indigo-500 focus:bg-white rounded-2xl mb-6 outline-none transition-all font-black text-center text-gray-900 tracking-[0.2em] placeholder:tracking-normal placeholder:text-gray-300 text-lg uppercase"
              maxLength={8}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
              >
                Hủy
              </button>
              <button
                onClick={handleJoinWithCode}
                className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
