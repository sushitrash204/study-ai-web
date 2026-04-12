'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useStats } from '@/hooks/stats/useStats';
import Image from 'next/image';
import * as studyGroupService from '@/services/studyGroupService';
import { StudyGroup } from '@/services/studyGroupService';
import {
   BookOpen,
   FileText,
   Sparkles,
   User,
   Users,
   Zap,
   Calendar,
   Award,
   ArrowRight
} from 'lucide-react';

export default function Dashboard() {
   const { user, isAuthenticated, isInitializing } = useAuthStore();
   const router = useRouter();
   const { stats, isLoading: isStatsLoading } = useStats();
   
   const [recommendedGroups, setRecommendedGroups] = useState<StudyGroup[]>([]);
   const [isGroupsLoading, setIsGroupsLoading] = useState(true);

   useEffect(() => {
      if (!isInitializing && !isAuthenticated) {
         router.push('/login');
      } else if (isAuthenticated) {
         fetchRecommendedGroups();
      }
   }, [isAuthenticated, isInitializing, router]);

   const fetchRecommendedGroups = async () => {
      try {
         setIsGroupsLoading(true);
         const res = await studyGroupService.listStudyGroups(1, 3);
         setRecommendedGroups(res.data || []);
      } catch (error) {
         console.error('Error fetching recommended groups:', error);
      } finally {
         setIsGroupsLoading(false);
      }
   };

   if (isInitializing || !isAuthenticated) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
            </div>
         </div>
      );
   }

   const schedule = [
      { id: 1, title: "Machine Learning Workshop", time: "09:00 - 11:30 AM", date: "14", month: "TH 10" },
      { id: 2, title: "Kiểm tra Giữa kỳ UX Design", time: "02:00 - 04:00 PM", date: "16", month: "TH 10" }
   ];

   return (
      <div className="min-h-screen bg-[#F3F5F9] pb-12 pt-16">
         <div className="max-w-[1400px] mx-auto px-4 md:px-8">
            
            {/* 1. Hero Banner */}
            <section className="relative w-full h-[380px] rounded-[48px] overflow-hidden mb-8 mt-4 bg-gradient-to-r from-[#DCD7FF] via-[#E2E8FF] to-[#F1F4FF] shadow-xl border border-white/50 group">
               <div className="absolute inset-0 z-0">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-400/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
               </div>

               <div className="relative z-10 h-full flex items-center px-12 md:px-20">
                  <div className="max-w-2xl space-y-6">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-md rounded-full border border-white/40 shadow-sm animate-fade-in">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest leading-none">Premium Experience</span>
                     </div>
                     <h2 className="text-5xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">
                        Khám phá kho <br/> tàng kiến thức
                     </h2>
                     <p className="text-gray-500 font-bold text-lg max-w-md leading-relaxed">
                        Nâng tầm hành trình học tập của bạn với AI Mentor cá nhân hóa và lộ trình học tập tối ưu nhất.
                     </p>
                     <button 
                        onClick={() => router.push('/subjects')}
                        className="flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-2xl font-black shadow-lg shadow-purple-500/10 hover:shadow-xl hover:scale-105 transition-all active:scale-95 group/btn"
                     >
                        Truy cập môn học
                        <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                     </button>
                  </div>

                  <div className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2 w-[480px] h-[480px]">
                     <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-1000">
                        <Image 
                           src="/dashboard/hero.png" 
                           alt="Student Illustration" 
                           fill 
                           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                           className="object-contain drop-shadow-2xl"
                        />
                     </div>
                  </div>
               </div>
            </section>

            {/* 2. Stats Row */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
               {[
                  { label: "Tổng môn học", value: stats.totalSubjects, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-100/50" },
                  { label: "Môn của bạn", value: stats.mySubjects, icon: User, color: "text-indigo-600", bg: "bg-indigo-100/50" },
                  { label: "Tài liệu đã tải", value: stats.totalDocuments, icon: FileText, color: "text-blue-600", bg: "bg-blue-100/50" },
                  { label: "Học nhóm", value: stats.totalGroups, icon: Award, color: "text-pink-600", bg: "bg-pink-100/50" }
               ].map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[32px] border border-white shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow group cursor-pointer">
                     <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <item.icon size={28} className={item.color} />
                     </div>
                     <div>
                        <p className="text-gray-400 font-black text-[10px] uppercase tracking-wider mb-1">{item.label}</p>
                        <h4 className="text-3xl font-black text-gray-900">{isStatsLoading ? '—' : item.value}</h4>
                     </div>
                  </div>
               ))}
            </section>

            {/* 3. Main Split View */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
               
               {/* Left Column: Recommendations */}
               <div className="xl:col-span-8 space-y-6">
                  <div className="flex items-center justify-between mb-4 px-2">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                           <Users size={20} className="text-indigo-600" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Nhóm học tập đề xuất</h3>
                     </div>
                     <button 
                        onClick={() => router.push('/study-groups')}
                        className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-[0.2em] bg-indigo-50 px-4 py-2 rounded-xl"
                     >
                        Khám phá thêm
                     </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {isGroupsLoading ? (
                        Array(3).fill(0).map((_, i) => (
                           <div key={i} className="bg-white h-[320px] rounded-[32px] animate-pulse border border-white" />
                        ))
                     ) : recommendedGroups.length > 0 ? (
                        recommendedGroups.map((group) => (
                           <div key={group.id} className="bg-white rounded-[32px] overflow-hidden border border-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full">
                              <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50">
                                 {group.avatarUrl ? (
                                    <Image 
                                       src={group.avatarUrl} 
                                       alt={group.name} 
                                       fill 
                                       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                       className="object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                 ) : (
                                    <div className="absolute inset-0 flex items-center justify-center p-8 opacity-20">
                                       <Users size={80} className="text-indigo-600" />
                                    </div>
                                 )}
                                 <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur rounded-lg shadow-sm flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider">Public</span>
                                 </div>
                              </div>
                              <div className="p-6 flex flex-col flex-1 space-y-4">
                                 <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-purple-100 rounded-md flex items-center justify-center">
                                       <User size={12} className="text-purple-600" />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">
                                       {group.owner?.firstName} {group.owner?.lastName}
                                    </p>
                                 </div>
                                 <h4 className="text-lg font-black text-gray-900 leading-tight flex-1 line-clamp-2">{group.name}</h4>
                                 <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-gray-500">
                                       <Users size={14} className="text-indigo-500" />
                                       <span className="text-xs font-bold">{group.GroupMembers?.length || 1} Thành viên</span>
                                    </div>
                                    <button 
                                       onClick={() => router.push(`/study-groups/${group.id}`)}
                                       className="text-[10px] font-black text-white bg-indigo-600 px-4 py-2 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest"
                                    >
                                       Tham gia
                                    </button>
                                 </div>
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="col-span-full py-12 text-center bg-white rounded-[32px] border border-dashed border-gray-200">
                           <Users size={40} className="mx-auto text-gray-300 mb-3" />
                           <p className="text-gray-400 font-bold">Chưa có nhóm học tập đề xuất nào.</p>
                        </div>
                     )}
                  </div>
               </div>

               {/* Right Column: Sidebar */}
               <div className="xl:col-span-4 space-y-6">
                  
                  {/* AI Mentor Widget */}
                  <div className="bg-[#6366F1] rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20 group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                     <div className="relative z-10 space-y-6">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                           <Sparkles size={24} className="text-white fill-white" />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-2xl font-black tracking-tight">AI Mentor</h3>
                           <p className="text-white/80 font-medium text-sm leading-relaxed">
                              Chào bạn! Tôi đã chuẩn bị xong kế hoạch học tập hôm nay cho bạn. Bạn muốn bắt đầu với môn nào?
                           </p>
                        </div>
                        <div className="space-y-2">
                           <button className="w-full flex items-center gap-3 px-5 py-3.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group/item">
                              <Zap size={18} className="text-amber-400 fill-amber-400" />
                              <span className="text-xs font-black uppercase tracking-widest">Bắt đầu ôn tập nhanh</span>
                           </button>
                           <button className="w-full flex items-center gap-3 px-5 py-3.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group/item">
                              <FileText size={18} className="text-white" />
                              <span className="text-xs font-black uppercase tracking-widest">Tóm tắt bài giảng mới</span>
                           </button>
                        </div>
                        <button className="w-full py-4 bg-white text-[#6366F1] rounded-2xl font-black text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                           Trò chuyện với Mentor
                        </button>
                     </div>
                  </div>

                  {/* Upcoming Schedule */}
                  <div className="bg-white rounded-[40px] p-8 border border-white shadow-sm space-y-6">
                     <h3 className="text-xl font-black text-gray-900 tracking-tight">Lịch học sắp tới</h3>
                     <div className="space-y-4">
                        {schedule.map((item) => (
                           <div key={item.id} className="flex items-center gap-4 group cursor-pointer hover:bg-gray-50 p-2 rounded-2xl transition-all">
                              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border border-gray-100 shrink-0 group-hover:bg-white group-hover:border-purple-200 transition-colors">
                                 <span className="text-lg font-black text-gray-900 leading-none">{item.date}</span>
                                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{item.month}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="text-sm font-black text-gray-900 truncate tracking-tight">{item.title}</h4>
                                 <div className="flex items-center gap-2 text-gray-400 mt-0.5">
                                    <Calendar size={12} />
                                    <span className="text-[11px] font-bold">{item.time}</span>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                     <button className="w-full py-3 border-2 border-gray-50 rounded-2xl text-[11px] font-black text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all uppercase tracking-widest">
                        Xem lịch chi tiết
                     </button>
                  </div>

               </div>
            </div>
         </div>
      </div>
   );
}
