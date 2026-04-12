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
  Trash2,
  ArrowRight,
  Edit3,
  Eye
} from 'lucide-react';
import { AdminStatCard } from '@/components/admin/common/AdminCard';
import { LessonModel } from '@/models/Lesson';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminLessons } from '@/hooks/admin/useAdminLessons';

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { label: string; color: string; bg: string }> = {
    PUBLIC: { label: 'Đã công khai', color: 'text-emerald-700', bg: 'bg-emerald-50' },
    DRAFT: { label: 'Bản nháp', color: 'text-amber-700', bg: 'bg-amber-50' },
    PRIVATE: { label: 'Riêng tư', color: 'text-gray-600', bg: 'bg-gray-100' },
  };
  const c = config[status] || config.DRAFT;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${c.bg} ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'PUBLIC' ? 'bg-emerald-500' : status === 'DRAFT' ? 'bg-amber-500' : 'bg-gray-400'}`} />
      {c.label}
    </span>
  );
};

export default function AdminLessonsPage() {
  const router = useRouter();
  const { state, actions } = useAdminLessons();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-violet-600 mb-1">
              <BookMarked size={16} strokeWidth={2} />
              <span className="font-medium uppercase tracking-wider text-[10px]">Hệ thống bài giảng</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Bài học</h1>
            <p className="text-gray-500 text-sm mt-0.5">Quản lý nội dung bài học và học liệu.</p>
          </div>

          <button
            onClick={() => router.push('/admin/lessons/new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Plus size={16} />
            <span>Thêm Bài học</span>
          </button>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <AdminStatCard label="Tổng bài học" value={state.lessons.length} icon={BookMarked} color="violet" />
          <AdminStatCard label="Đã công khai" value={state.lessons.filter(l => l.status === 'PUBLIC').length} icon={Eye} color="emerald" />
          <AdminStatCard label="Môn học" value={state.subjects.length} icon={BookOpen} color="orange" />
          <AdminStatCard label="Khối lớp" value={state.classes.length} icon={GraduationCap} color="blue" />
        </section>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3 text-gray-500">
            <Filter size={14} />
            <span className="font-medium text-xs uppercase tracking-wider">Lọc</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm bài học..."
                className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-violet-500 text-sm"
              />
            </div>
            <select
              value={state.selectedClassId}
              onChange={(e) => actions.setSelectedClassId(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 appearance-none cursor-pointer"
            >
              <option value="">Tất cả Khối lớp</option>
              {state.classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={state.selectedSubjectId}
              onChange={(e) => actions.setSelectedSubjectId(e.target.value)}
              disabled={!state.selectedClassId}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 appearance-none disabled:opacity-50 cursor-pointer"
            >
              <option value="">{state.selectedClassId ? 'Tất cả Môn học' : 'Chọn lớp trước'}</option>
              {state.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* Lessons Grid */}
        {state.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white h-[140px] rounded-lg animate-pulse border border-gray-200" />
            ))}
          </div>
        ) : state.lessons.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => router.push(`/admin/lessons/${lesson.id}`)}
                  className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-violet-300 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <h4 className="text-base font-semibold text-gray-900 line-clamp-2 flex-1 group-hover:text-violet-600 transition-colors leading-snug">
                      {lesson.title}
                    </h4>
                    <span className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                      lesson.status === 'PUBLIC' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${lesson.status === 'PUBLIC' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {lesson.status === 'PUBLIC' ? 'Đã công khai' : 'Bản nháp'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mb-4 font-medium uppercase tracking-wide">Sắp xếp: {lesson.order}</p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {lesson.subject?.class?.name && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-semibold">
                        <GraduationCap size={14} />
                        {lesson.subject.class.name}
                      </span>
                    )}
                    {lesson.subject?.name && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-xs font-semibold">
                        <BookOpen size={14} />
                        {lesson.subject.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar size={15} />
                      <span>{lesson.createdAt ? new Date(lesson.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong'}</span>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/admin/lessons/${lesson.id}`}>
                        <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-violet-600 transition-all">
                          <Eye size={17} />
                        </button>
                      </Link>
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/admin/lessons/${lesson.id}`); }}
                        className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-violet-600 transition-all"
                      >
                        <Edit3 size={17} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); actions.handleDeleteLesson(lesson.id); }}
                        className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-all"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {state.hasMore && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={actions.handleLoadMore}
                  disabled={state.isIdling}
                  className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {state.isIdling ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Tải thêm</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 py-12 text-center">
            <BookMarked size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">Chưa có bài học nào.</p>
            <p className="text-gray-400 text-sm mt-1">Hãy tạo bài học đầu tiên!</p>
          </div>
        )}

      </div>
    </div>
  );
}
