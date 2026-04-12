'use client';

import React from 'react';
import {
  BookOpen,
  Search,
  Plus,
  X,
  Check,
  GraduationCap,
  Trash2,
  Settings2,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { AdminCard, AdminStatCard } from '@/components/admin/common/AdminCard';
import { AdminBadge } from '@/components/admin/common/AdminBadge';
import { AdminActionButton } from '@/components/admin/common/AdminActionButton';
import { Subject } from '@/models/Subject';
import { useAdminSubjects, PRESET_COLORS } from '@/hooks/admin/useAdminSubjects';

export default function AdminSubjectsPage() {
  const { state, actions } = useAdminSubjects();

  const SubjectCard = ({ subject }: { subject: Subject }) => (
    <div
      onClick={() => actions.handleOpenModal(subject)}
      className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-violet-300 hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 group-hover:scale-105 transition-transform"
          style={{ backgroundColor: subject.color }}
        >
          <BookOpen size={26} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-gray-900 line-clamp-1 group-hover:text-violet-600 transition-colors">
            {subject.name}
          </h4>
          {subject.class && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-semibold mt-2">
              <GraduationCap size={13} />
              {subject.class.name}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
          subject.status === 'PUBLIC' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${subject.status === 'PUBLIC' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {subject.status === 'PUBLIC' ? 'Đã công khai' : 'Bản nháp'}
        </span>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); actions.handleOpenModal(subject); }}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-violet-600 transition-all"
          >
            <Settings2 size={17} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); actions.handleDeleteSubject(subject.id); }}
            className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-all"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F5F9] pb-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600">
              <BookOpen size={18} strokeWidth={2.5} />
              <span className="font-black uppercase tracking-widest text-[10px]">Cấu trúc chương trình</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Quản lý Môn học</h1>
            <p className="text-gray-500 font-medium text-lg">Quản lý danh mục môn học theo từng khối lớp.</p>
          </div>

          <button
            onClick={() => actions.handleOpenModal(null)}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-105 transition-all active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            <span>Thêm Môn học</span>
          </button>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AdminStatCard
            label="Tổng môn học"
            value={state.subjects.length}
            icon={BookOpen}
            color="violet"
          />

          <AdminStatCard
            label="Đã công khai"
            value={state.subjects.filter(s => s.status === 'PUBLIC').length}
            icon={Eye}
            color="emerald"
          />

          <AdminStatCard
            label="Bản nháp"
            value={state.subjects.filter(s => s.status === 'DRAFT').length}
            icon={EyeOff}
            color="amber"
          />

          <AdminStatCard
            label="Khối lớp"
            value={state.classes.length}
            icon={GraduationCap}
            color="blue"
          />
        </section>

        {/* Search */}
        <AdminCard hoverable={false} className="mb-8">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm môn học hoặc khối lớp..."
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 font-bold transition-all"
              value={state.searchQuery}
              onChange={(e) => actions.setSearchQuery(e.target.value)}
            />
          </div>
        </AdminCard>

        {/* Subjects Grid */}
        {state.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white h-[240px] rounded-[32px] animate-pulse border border-white" />
            ))}
          </div>
        ) : state.subjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.subjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </div>

            {state.hasMore && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={actions.handleLoadMore}
                  disabled={state.isIdling}
                  className="px-10 py-4 bg-white border-2 border-violet-600 text-violet-600 rounded-2xl font-black hover:bg-violet-600 hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 group shadow-lg shadow-violet-100"
                >
                  {state.isIdling ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Tải thêm môn học</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <AdminCard hoverable={false}>
            <div className="py-16 text-center">
              <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-black text-lg">Chưa có môn học nào.</p>
              <p className="text-gray-400 font-medium text-sm mt-2">Hãy tạo môn học đầu tiên!</p>
            </div>
          </AdminCard>
        )}

        {/* Create/Edit Modal */}
        {state.isModalOpen && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                      {state.editingSubject ? 'Chỉnh sửa Môn học' : 'Thêm Môn học mới'}
                    </h2>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Thông tin chi tiết môn học</p>
                  </div>
                  <button onClick={() => actions.setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={24} className="text-gray-400" />
                  </button>
                </div>

                <form onSubmit={actions.handleSaveSubject} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-sm font-black text-gray-900 ml-1">Tên môn học</label>
                      <input
                        type="text"
                        required
                        placeholder="VD: Toán học..."
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-100 focus:border-violet-600 outline-none font-bold transition-all"
                        value={state.formData.name}
                        onChange={(e) => actions.setFormData({ ...state.formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-black text-gray-900 ml-1">Gán vào khối lớp</label>
                      <select
                        required
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-violet-100 focus:border-violet-600 outline-none font-bold transition-all appearance-none cursor-pointer"
                        value={state.formData.classId}
                        onChange={(e) => actions.setFormData({ ...state.formData, classId: e.target.value })}
                      >
                        <option value="">Chọn một lớp...</option>
                        {state.classes.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-black text-gray-900 ml-1">Chọn màu sắc đại diện</label>
                    <div className="flex flex-wrap gap-3 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                      {PRESET_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => actions.setFormData({ ...state.formData, color })}
                          className={`w-12 h-12 rounded-xl transition-all shadow-md flex items-center justify-center ${state.formData.color === color ? 'ring-4 ring-violet-600/30 scale-110' : 'hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                        >
                          {state.formData.color === color && <Check className="text-white" size={20} strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-black text-gray-900 ml-1">Trạng thái phát hành</label>
                    <div className="flex bg-gray-50 border border-gray-200 rounded-2xl p-1 gap-1">
                      <button
                        type="button"
                        onClick={() => actions.setFormData({...state.formData, status: 'DRAFT'})}
                        className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${state.formData.status === 'DRAFT' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-400'}`}
                      >
                        Bản nháp
                      </button>
                      <button
                        type="button"
                        onClick={() => actions.setFormData({...state.formData, status: 'PUBLIC'})}
                        className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${state.formData.status === 'PUBLIC' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-400'}`}
                      >
                        Công khai
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => actions.setIsModalOpen(false)}
                      className="flex-1 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl hover:bg-gray-200 transition-all"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-violet-200 hover:shadow-xl transition-all"
                    >
                      {state.editingSubject ? 'Lưu thay đổi' : 'Tạo môn học'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
