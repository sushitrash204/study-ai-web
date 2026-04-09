'use client';

import React from 'react';
import { 
  Plus, 
  Search, 
  BookMarked, 
  Filter, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  Edit3,
  ExternalLink,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { DataTable } from '@/components/admin/common/DataTable';
import { StatusBadge } from '@/components/admin/common/StatusBadge';
import { SystemBadge } from '@/components/admin/common/SystemBadge';
import { LessonModel } from '@/models/Lesson';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminLessons } from '@/hooks/admin/useAdminLessons';

export default function AdminLessonsPage() {
  const router = useRouter();
  const { state, actions } = useAdminLessons();

  const columns = [
    { 
      key: 'title', 
      header: 'Tên bài học',
      render: (item: LessonModel) => (
        <div className="flex flex-col">
            <span className="text-base font-black tracking-tight">{item.title}</span>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Order: {item.order}</span>
        </div>
      )
    },
    { 
      key: 'context', 
      header: 'Phân loại',
      render: (item: LessonModel) => (
        <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-1.5 text-[#F59E0B] font-bold text-xs uppercase">
                <GraduationCap size={12} />
                <span>{item.subject?.class?.name}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-[#8B5CF6] font-bold text-xs uppercase">
                <BookOpen size={12} />
                <span>{item.subject?.name}</span>
            </div>
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Trạng thái',
      render: (item: LessonModel) => <StatusBadge status={item.status} />
    },
    { 
      key: 'isSystem', 
      header: 'Loại',
      render: (item: LessonModel) => <SystemBadge isSystem={item.subject?.isSystem || false} />
    },
    { 
      key: 'createdAt', 
      header: 'Ngày tạo',
      render: (item: LessonModel) => (
        <div className="flex items-center space-x-2 text-gray-400 font-bold text-[13px]">
          <Calendar size={14} />
          <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong'}</span>
        </div>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (item: LessonModel) => (
        <div className="flex justify-end space-x-2">
          <Link 
            href={`/admin/lessons/${item.id}`}
            className="p-2 hover:bg-[#F5F3FF] rounded-xl transition-all text-gray-400 hover:text-[#8B5CF6]"
            title="Xem chi tiết"
          >
            <ExternalLink size={18} strokeWidth={2.5} />
          </Link>
          <button 
            onClick={(e) => { e.stopPropagation(); router.push(`/admin/lessons/${item.id}`); }}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-[#1F2937]"
            title="Chỉnh sửa"
          >
            <Edit3 size={18} strokeWidth={2.5} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); actions.handleDeleteLesson(item.id); }}
            className="p-2 hover:bg-[#FEF2F2] rounded-xl transition-all text-gray-400 hover:text-[#EF4444]"
            title="Xóa bài học"
          >
            <Trash2 size={18} strokeWidth={2.5} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#8B5CF6]">
                <BookMarked size={20} strokeWidth={2.5} />
                <span className="font-black uppercase tracking-widest text-[11px]">Nội Dung Bài Học</span>
            </div>
            <h1 className="text-4xl font-black text-[#1F2937] tracking-tight">Quản lý Bài học</h1>
            <p className="text-[#6B7280] font-medium text-lg">Thiết lập chi tiết các bài học cho từng khối lớp và môn học.</p>
        </div>
        <button 
          onClick={() => router.push('/admin/lessons/new')}
          className="flex items-center justify-center space-x-2 px-6 py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-[24px] font-black shadow-lg shadow-purple-500/20 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Thêm Bài học</span>
        </button>
      </header>

      {/* Filters & Search */}
      <section className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] shadow-sm space-y-6">
        <div className="flex items-center space-x-2 text-gray-400 pl-2">
            <Filter size={18} strokeWidth={2.5} />
            <span className="font-black uppercase tracking-widest text-[10px]">Bộ lọc dữ liệu</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="md:col-span-2 relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm bài học..." 
                    className="w-full pl-14 pr-6 py-4 bg-[#F9FAFA] border border-[#E5E7EB] rounded-2xl focus:outline-none focus:border-[#8B5CF6] font-bold transition-all"
                />
            </div>
            
            <select 
                value={state.selectedClassId}
                onChange={(e) => actions.setSelectedClassId(e.target.value)}
                className="px-5 py-4 bg-[#F9FAFA] border border-[#E5E7EB] rounded-2xl focus:outline-none focus:border-[#8B5CF6] font-bold text-[#1F2937] appearance-none"
            >
                <option value="">Tất cả Khối lớp</option>
                {state.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select 
                value={state.selectedSubjectId}
                onChange={(e) => actions.setSelectedSubjectId(e.target.value)}
                disabled={!state.selectedClassId}
                className="px-5 py-4 bg-[#F9FAFA] border border-[#E5E7EB] rounded-2xl focus:outline-none focus:border-[#8B5CF6] font-bold text-[#1F2937] appearance-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <option value="">{state.selectedClassId ? 'Tất cả Môn học' : 'Chọn lớp trước'}</option>
                {state.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
        </div>
      </section>

      {/* Table Section */}
      <DataTable 
        columns={columns} 
        data={state.lessons} 
        isLoading={state.isLoading} 
        onRowClick={(item) => router.push(`/admin/lessons/${item.id}`)} 
      />

      {state.hasMore && (
        <div className="flex justify-center pt-8">
          <button 
            onClick={actions.handleLoadMore}
            disabled={state.isIdling}
            className="px-10 py-4 bg-white border-2 border-[#8B5CF6] text-[#8B5CF6] rounded-[24px] font-black hover:bg-[#8B5CF6] hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-3 group shadow-lg shadow-purple-500/5"
          >
            {state.isIdling ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Tải thêm bài giảng</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
