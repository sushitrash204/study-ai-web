'use client';

import React from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  BookMarked, 
  FileText, 
  ShieldCheck,
  TrendingUp,
  Settings
} from 'lucide-react';
import { AdminStatCard } from '@/components/admin/common/AdminStatCard';
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';

export default function AdminDashboard() {
  const { state, actions } = useAdminDashboard();

  if (state.isLoading) {
    return (
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-[28px] border border-gray-200"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">
      {/* Header */}
      <header className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2 text-[#8B5CF6]">
          <ShieldCheck size={20} strokeWidth={2.5} />
          <span className="font-black uppercase tracking-widest text-[11px]">Trung tâm quản trị</span>
        </div>
        <h1 className="text-4xl font-black text-[#1F2937] tracking-tight">Tổng quan chương trình</h1>
        <p className="text-[#6B7280] font-medium text-lg">Hệ thống phân phối chương trình và quản lý học tập.</p>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStatCard 
          label="Tổng số Học viên" 
          value={state.stats?.users.total || 0} 
          icon={Users} 
          color="purple" 
          onClick={() => actions.navigateTo('/admin/users')}
        />
        <AdminStatCard 
          label="Tổng số Admin" 
          value={state.stats?.users.admins || 0} 
          icon={ShieldCheck} 
          color="blue" 
          onClick={() => actions.navigateTo('/admin/users')}
        />
        <AdminStatCard 
          label="Tổng số Môn học" 
          value={state.stats?.content.subjects || 0} 
          icon={BookOpen} 
          color="teal" 
          onClick={() => actions.navigateTo('/admin/subjects')}
        />
        <AdminStatCard 
          label="Khối lớp" 
          value={state.stats?.content.classes || 0} 
          icon={GraduationCap} 
          color="orange" 
          onClick={() => actions.navigateTo('/admin/classes')}
        />
        <AdminStatCard 
          label="Số lượng Bài học" 
          value={state.stats?.content.lessons || 0} 
          icon={BookMarked} 
          color="green" 
          onClick={() => actions.navigateTo('/admin/lessons')}
        />
        <AdminStatCard 
          label="Tài liệu & Bài tập" 
          value={(state.stats?.content.documents || 0) + (state.stats?.content.exercises || 0)} 
          icon={FileText} 
          color="red" 
          onClick={() => actions.navigateTo('/admin/lessons')}
        />
      </section>

      {/* Quick Actions / Recent Activity Placeholder */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-[#1F2937] tracking-tight">Hoạt động mới nhất</h3>
            <TrendingUp size={20} className="text-[#8B5CF6]" />
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
             <div className="w-16 h-16 bg-[#F5F3FF] rounded-2xl flex items-center justify-center">
                <Settings size={32} className="text-[#8B5CF6] opacity-50" />
             </div>
             <p className="text-gray-400 font-bold">Tính năng đang phát triển</p>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 space-y-6 shadow-sm relative overflow-hidden">
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5F3FF] rounded-full -mr-16 -mt-16 opacity-50"></div>
           
           <h3 className="text-xl font-black text-[#1F2937] tracking-tight relative z-10">Hướng dẫn Admin</h3>
           <div className="space-y-4 relative z-10">
              {[
                { title: "Hướng dẫn cấu trúc", desc: "Sử dụng mô hình Khối lớp → Môn học → Bài học để đồng bộ nội dung." },
                { title: "Trạng thái hiển thị", desc: "Tài liệu 'Công khai' sẽ hiển thị trực tiếp cho người dùng trên ứng dụng." },
                { title: "Bảo mật tài khoản", desc: "Lưu ý khi thay đổi quyền quản trị và quản lý học viên." }
              ].map((item, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="w-8 h-8 shrink-0 bg-[#F5F3FF] text-[#8B5CF6] border border-[#E5E7EB] rounded-lg flex items-center justify-center font-black text-sm">{i+1}</div>
                  <div className="space-y-1">
                     <p className="font-bold text-sm text-[#1F2937]">{item.title}</p>
                     <p className="text-[#6B7280] text-xs font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
}
