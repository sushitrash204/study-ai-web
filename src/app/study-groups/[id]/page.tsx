'use client';

import React, { useState, useEffect } from 'react';
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
  Trophy,
  Medal,
  TrendingUp,
} from 'lucide-react';
import * as studyGroupService from '@/services/studyGroupService';
import { StudyGroup, GroupMember } from '@/services/studyGroupService';
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
  const [tab, setTab] = useState<'info' | 'members' | 'requests' | 'resources' | 'management'>('info');
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

  const isMember = members.some(m => m.userId === currentUser?.id) || group?.ownerId === currentUser?.id;
  const isAdmin = group?.ownerId === currentUser?.id || 
                  members.find(m => m.userId === currentUser?.id)?.role === 'admin';

  useEffect(() => {
    loadGroupData();
  }, [groupId]);


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
           <div className="lg:col-span-8 space-y-6">
              {/* Modern Glass Tabs */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl p-1.5 border border-white flex gap-1 shadow-sm">
                 {[
                    { id: 'info', label: 'Tầm nhìn', icon: Shield },
                    { id: 'members', label: 'Cộng sự', icon: Users },
                    ...(isAdmin ? [{ id: 'requests', label: 'Duyệt', icon: UserPlus }] : []),
                    { id: 'resources', label: 'Tài liệu', icon: Zap },
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

                  {/* Members Tab */}
                  {tab === 'members' && (
                     <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {members.map((member) => (
                              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-indigo-100 rounded-2xl transition-all group">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 text-indigo-600 font-black shadow-sm group-hover:scale-110 transition-transform">
                                       {member.user?.firstName?.[0]}
                                    </div>
                                    <div>
                                       <p className="font-black text-gray-900 text-sm tracking-tight">{member.user?.firstName} {member.user?.lastName}</p>
                                       <p className={`text-[9px] font-black uppercase tracking-widest ${member.role === 'admin' ? 'text-indigo-600' : 'text-gray-400'}`}>
                                          {member.role === 'admin' ? 'Admin' : 'Member'}
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

           {/* Sidebar Statistics */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-50"></div>
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6">Thống kê</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                       <span className="text-gray-400 font-bold text-[11px] uppercase tracking-widest">Thành viên</span>
                       <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-black text-xs">{members.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                       <span className="text-gray-400 font-bold text-[11px] uppercase tracking-widest">Yêu cầu chờ</span>
                       <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-lg font-black text-xs">{pendingRequests.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                       <span className="text-gray-400 font-bold text-[11px] uppercase tracking-widest">Tài liệu</span>
                       <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg font-black text-xs">{resources.length}</span>
                    </div>
                 </div>
              </div>

              {isMember && group?.ownerId !== currentUser?.id && (
                 <button onClick={handleLeaveGroup} className="w-full py-4 text-red-500/60 hover:text-red-500 rounded-2xl font-black uppercase text-[9px] tracking-[0.3em] transition-all flex items-center justify-center gap-2 hover:bg-red-50">
                    <LogOut size={14} />
                    Rời nhóm
                 </button>
              )}
           </div>
        </div>

        <ShareResourceModal 
           isOpen={showShareModal}
           onClose={() => setShowShareModal(false)}
           groupId={groupId}
           existingResources={resources}
           onSuccess={loadGroupData}
        />

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
