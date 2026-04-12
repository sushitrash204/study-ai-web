'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Users,
  Globe,
  Lock,
  Search,
  X,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import * as studyGroupService from '@/services/studyGroupService';
import { useAuthStore } from '@/store/authStore';

// Custom debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function StudyGroupsPage() {
  const router = useRouter();
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [publicGroups, setPublicGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'my' | 'public'>('my');
  const [inviteCode, setInviteCode] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { isAuthenticated, isInitializing } = useAuthStore();

  const loadGroups = useCallback(async (isSearching = false) => {
    try {
      if (!isSearching) setLoading(true);
      
      const promises: any[] = [studyGroupService.getUserStudyGroups()];
      
      // Only search public groups on backend, for my groups we filter locally
      promises.push(studyGroupService.listStudyGroups(1, 20, debouncedSearch));
      
      const [my, pub] = await Promise.all(promises);
      setMyGroups(my);
      setPublicGroups(pub?.data || []);
    } catch (error: any) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      loadGroups(!!debouncedSearch);
    } else if (!isInitializing && !isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated, isInitializing, debouncedSearch, loadGroups]);

  const handleJoinWithCode = async () => {
    if (!inviteCode.trim()) return;
    try {
      const response = await studyGroupService.joinByCode(inviteCode);
      alert(response.message || 'Thao tác thành công!');
      setShowInviteModal(false);
      setInviteCode('');
      await loadGroups();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể sử dụng mã mời này');
    }
  };

  const filteredGroups = tab === 'my' 
    ? myGroups.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        g.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : publicGroups;

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-24 relative overflow-hidden">
      {/* Dynamic Mesh Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-50 to-transparent z-0 opacity-70"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/20 rounded-full blur-[120px] z-0"></div>
      
      <div className="relative z-10 p-4 md:p-8 pt-20">
        {/* Header */}
        <header className="max-w-[1100px] mx-auto mb-10 text-center">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
               <Users size={20} className="text-indigo-600" />
            </div>
            <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.25em]">Cộng đồng tri thức</p>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">
            Khám phá Nhóm
          </h1>
          <p className="text-gray-500 font-bold text-base max-w-xl mx-auto opacity-70">Kết nối cùng hàng nghìn học viên tài năng trên toàn quốc.</p>
        </div>
      </header>

      {/* Advanced Search & Action Bar */}
      <div className="max-w-[1100px] mx-auto mb-12 space-y-4">
        {/* Search Bar - Modern & Compact */}
        <div className="relative group max-w-2xl mx-auto">
           <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
              <Search size={18} />
           </div>
           <input
              type="text"
              placeholder="Tìm tên nhóm, mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/70 backdrop-blur-xl border border-white focus:border-indigo-100 px-12 py-3.5 rounded-2xl outline-none font-bold text-gray-900 shadow-sm transition-all placeholder:text-gray-400 text-sm"
           />
        </div>

        {/* Action Bar - Sleek Pills */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/50 backdrop-blur-xl p-2 rounded-3xl border border-white shadow-sm">
          <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-[20px] w-full md:w-auto">
            <button
              onClick={() => setTab('my')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-[16px] text-[10px] font-black uppercase tracking-wider transition-all ${
                tab === 'my' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-gray-900'
              }`}
            >
              Của tôi • {myGroups.length}
            </button>
            <button
              onClick={() => setTab('public')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-[16px] text-[10px] font-black uppercase tracking-wider transition-all ${
                tab === 'public' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-gray-900'
              }`}
            >
              Khám phá • {publicGroups.length}
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

      {/* Content Grid */}
      <div className="max-w-5xl mx-auto">
        {loading && !debouncedSearch ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đang kết nối cộng đồng...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-indigo-50 rounded-[32px] flex items-center justify-center mb-6">
               <Search size={40} className="text-indigo-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              {searchQuery ? 'Không tìm thấy kết quả' : (tab === 'my' ? 'Chưa tham gia nhóm nào' : 'Sảnh chờ đang rỗng')}
            </h3>
            <p className="text-gray-500 font-bold text-center max-w-sm mb-8 px-6">
              {searchQuery 
                ? `Không có nhóm nào khớp với từ khóa "${searchQuery}". Thử từ khóa khác xem sao!`
                : (tab === 'my'
                  ? 'Bắt đầu hành trình học tập cùng bạn bè ngay hôm nay để đạt kết quả tốt nhất.'
                  : 'Hiện tại chưa có nhóm công khai nào. Hãy thử tự tạo một cộng đồng mới!')}
            </p>
            {!searchQuery && tab === 'my' && (
              <button
                onClick={() => router.push('/study-groups/create')}
                className="px-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 text-xs uppercase tracking-widest"
              >
                Tạo nhóm ngay
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            {filteredGroups.map((group) => (
              <Link
                key={group.id}
                href={`/study-groups/${group.id}`}
                className="group"
              >
                <div className="h-full bg-white rounded-3xl border border-white shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 overflow-hidden cursor-pointer relative flex flex-col">
                  {/* Premium Media Header */}
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
                          <div className="px-2 py-0.5 bg-white/10 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-wider text-white border border-white/5 mx-1 my-1">
                            {group.isPublic ? 'PUBLIC' : 'PRIVATE'}
                          </div>
                          <div className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10">
                             {group.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                          </div>
                       </div>
                       <div className="space-y-0.5">
                          <h3 className="font-black text-white text-lg truncate leading-tight">
                            {group.name}
                          </h3>
                          <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">
                             ID • {group.id.substring(0, 8)}
                          </p>
                       </div>
                    </div>
                  </div>

                  {/* Elegant Details Section */}
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
      </div>
    </div>

      {/* Join Modal */}
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
