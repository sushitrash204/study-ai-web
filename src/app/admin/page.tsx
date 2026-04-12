'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  GraduationCap,
  BookOpen,
  BookMarked,
  FileText,
  ShieldCheck,
  TrendingUp,
  Settings,
  ArrowRight,
  Crown,
  UserCheck,
  Database
} from 'lucide-react';
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';

export default function AdminDashboard() {
  const { state, actions } = useAdminDashboard();
  const router = useRouter();

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-[#F3F5F9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Đang tải dữ liệu quản trị...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F5F9] pb-12 pt-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">

        {/* 1. Hero Banner - Admin Edition */}
        <section className="relative w-full rounded-[48px] overflow-hidden mb-8 mt-4 bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#8B5CF6] shadow-2xl shadow-violet-300/30 border border-white/20">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
          </div>

          <div className="relative z-10 px-12 md:px-20 py-16">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-sm">
                <Crown size={12} className="text-amber-300 fill-amber-300" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Admin Control Center</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tight">
                Trung tâm <br/> quản trị
              </h2>
              <p className="text-white/80 font-bold text-lg max-w-md leading-relaxed">
                Quản lý toàn bộ hệ thống: người dùng, môn học, bài giảng và tài liệu.
              </p>
              <button
                onClick={() => router.push('/admin/users')}
                className="flex items-center gap-3 px-8 py-4 bg-white text-violet-700 rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 group"
              >
                Quản lý người dùng
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>

        {/* 2. Stats Row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Tổng học viên", value: state.stats?.users.total || 0, icon: Users, color: "text-violet-600", bg: "bg-violet-100/50", href: '/admin/users' },
            { label: "Admin", value: state.stats?.users.admins || 0, icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-100/50", href: '/admin/users' },
            { label: "Môn học", value: state.stats?.content.subjects || 0, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-100/50", href: '/admin/subjects' },
            { label: "Khối lớp", value: state.stats?.content.classes || 0, icon: GraduationCap, color: "text-pink-600", bg: "bg-pink-100/50", href: '/admin/classes' }
          ].map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => actions.navigateTo(item.href)}
              className="bg-white p-6 rounded-[32px] border border-white shadow-sm flex items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
            >
              <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <item.icon size={28} className={item.color} />
              </div>
              <div>
                <p className="text-gray-400 font-black text-[10px] uppercase tracking-wider mb-1">{item.label}</p>
                <h4 className="text-3xl font-black text-gray-900">{item.value}</h4>
              </div>
            </div>
          ))}
        </section>

        {/* 3. Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* Left Column: Detailed Stats */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Content Management */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-xl">
                  <Database size={20} className="text-violet-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Quản lý nội dung</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lessons Card */}
              <div 
                onClick={() => actions.navigateTo('/admin/lessons')}
                className="bg-white rounded-[32px] overflow-hidden border border-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
              >
                <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookMarked size={80} className="text-emerald-400 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-black text-gray-900">Bài giảng</h4>
                    <span className="text-3xl font-black text-emerald-600">{state.stats?.content.lessons || 0}</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Tổng số bài giảng trong hệ thống</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <UserCheck size={14} className="text-emerald-500" />
                      <span className="text-xs font-bold text-gray-500">Đang hoạt động</span>
                    </div>
                    <button className="text-[10px] font-black text-white bg-emerald-600 px-4 py-2 rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all uppercase tracking-widest">
                      Quản lý
                    </button>
                  </div>
                </div>
              </div>

              {/* Documents & Exercises Card */}
              <div 
                onClick={() => actions.navigateTo('/admin/lessons')}
                className="bg-white rounded-[32px] overflow-hidden border border-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer"
              >
                <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-orange-50 to-red-50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText size={80} className="text-orange-400 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-black text-gray-900">Tài liệu & Bài tập</h4>
                    <span className="text-3xl font-black text-orange-600">
                      {(state.stats?.content.documents || 0) + (state.stats?.content.exercises || 0)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Tài liệu và bài tập đã tải lên</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-orange-500" />
                      <span className="text-xs font-bold text-gray-500">Đã duyệt</span>
                    </div>
                    <button className="text-[10px] font-black text-white bg-orange-600 px-4 py-2 rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all uppercase tracking-widest">
                      Quản lý
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Actions & Guide */}
          <div className="xl:col-span-4 space-y-6">

            {/* Quick Actions Widget */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl shadow-violet-300/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                  <Settings size={24} className="text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight">Thao tác nhanh</h3>
                  <p className="text-white/80 font-medium text-sm leading-relaxed">
                    Truy cập nhanh các chức năng quản trị thường dùng.
                  </p>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={() => actions.navigateTo('/admin/users')}
                    className="w-full flex items-center gap-3 px-5 py-3.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group"
                  >
                    <Users size={18} className="text-white" />
                    <span className="text-xs font-black uppercase tracking-widest">Quản lý người dùng</span>
                  </button>
                  <button 
                    onClick={() => actions.navigateTo('/admin/subjects')}
                    className="w-full flex items-center gap-3 px-5 py-3.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group"
                  >
                    <BookOpen size={18} className="text-white" />
                    <span className="text-xs font-black uppercase tracking-widest">Quản lý môn học</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Guide */}
            <div className="bg-white rounded-[40px] p-8 border border-white shadow-sm space-y-6">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Hướng dẫn Admin</h3>
              <div className="space-y-4">
                {[
                  { title: "Cấu trúc hệ thống", desc: "Khối lớp → Môn học → Bài học để đồng bộ nội dung.", icon: '1', color: 'bg-violet-100 text-violet-600' },
                  { title: "Trạng thái hiển thị", desc: "Tài liệu 'Công khai' sẽ hiển thị cho người dùng.", icon: '2', color: 'bg-indigo-100 text-indigo-600' },
                  { title: "Bảo mật tài khoản", desc: "Lưu ý khi thay đổi quyền quản trị và quản lý học viên.", icon: '3', color: 'bg-blue-100 text-blue-600' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 shrink-0 ${item.color} rounded-lg flex items-center justify-center font-black text-sm`}>
                      {item.icon}
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-gray-900">{item.title}</p>
                      <p className="text-gray-500 text-xs font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
