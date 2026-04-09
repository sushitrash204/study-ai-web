'use client';

import React from 'react';
import { 
  BookOpen, 
  Search, 
  Eye, 
  EyeOff, 
  Settings2,
  Calendar,
  Layers,
  ArrowRight,
  Plus,
  X,
  Check,
  GraduationCap,
  Trash2
} from 'lucide-react';
import { DataTable } from '@/components/admin/common/DataTable';
import { StatusBadge } from '@/components/admin/common/StatusBadge';
import { SystemBadge } from '@/components/admin/common/SystemBadge';
import { Subject } from '@/models/Subject';
import { useAdminSubjects, PRESET_COLORS } from '@/hooks/admin/useAdminSubjects';

export default function AdminSubjectsPage() {
  const { state, actions } = useAdminSubjects();

  const columns = [
    { 
      key: 'name', 
      header: 'Tên môn học',
      render: (item: Subject) => (
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => actions.handleOpenModal(item)}>
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
            style={{ backgroundColor: item.color }}
          >
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight group-hover:text-[#8B5CF6] transition-colors">{item.name}</span>
            {item.class && (
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.class.name}</span>
            )}
          </div>
        </div>
      )
    },
    { 
       key: 'class', 
       header: 'Phân loại',
       render: (item: Subject) => (
         <div className="flex items-center space-x-2 text-[#F59E0B] font-black text-xs uppercase tracking-wider">
            <GraduationCap size={14} />
            <span>{item.class?.name || 'Chưa phân lớp'}</span>
         </div>
       )
    },
    { 
      key: 'status', 
      header: 'Trạng thái',
      render: (item: Subject) => <StatusBadge status={item.status || 'DRAFT'} />
    },
    { 
      key: 'isSystem', 
      header: 'Loại',
      render: (item: Subject) => <SystemBadge isSystem={item.isSystem || false} />
    },
    { 
      key: 'createdAt', 
      header: 'Ngày tạo',
      render: (item: Subject) => (
        <div className="flex items-center space-x-2 text-gray-400 font-bold text-[13px]">
          <Calendar size={14} />
          <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong'}</span>
        </div>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (item: Subject) => (
        <div className="flex justify-end space-x-2 pr-2">
          <button 
            onClick={() => actions.handleOpenModal(item)}
            className="p-2.5 text-[#6B7280] hover:text-[#8B5CF6] hover:bg-[#F5F3FF] rounded-xl transition-all active:scale-95"
            title="Chỉnh sửa"
          >
            <Settings2 size={20} strokeWidth={2.5} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); actions.handleDeleteSubject(item.id); }}
            className="p-2.5 bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] rounded-xl transition-all active:scale-95 shadow-sm"
            title="Xóa môn học"
          >
            <Trash2 size={20} strokeWidth={2.5} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#10B981]">
                <Layers size={20} strokeWidth={2.5} />
                <span className="font-black uppercase tracking-widest text-[11px]">Học thuật Hệ Thống</span>
            </div>
            <h1 className="text-4xl font-black text-[#1F2937] tracking-tight">Quản lý Môn học</h1>
            <p className="text-[#6B7280] font-medium text-lg">Phân loại môn học theo đúng khối lớp học tập.</p>
        </div>
        <button 
          onClick={() => actions.handleOpenModal(null)}
          className="flex items-center space-x-2 px-6 py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-[24px] font-black shadow-lg shadow-purple-500/20 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Thêm môn học mới</span>
        </button>
      </header>

      {/* Info Card */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm môn học hoặc khối lớp..." 
                    className="w-full pl-14 pr-6 py-4 bg-white border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#8B5CF6]/10 focus:border-[#8B5CF6] font-bold transition-all"
                    value={state.searchQuery}
                    onChange={(e) => actions.setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        <DataTable columns={columns} data={state.subjects} isLoading={state.isLoading} />

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
                  <span>Tải thêm môn học</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        )}
      </section>

      {/* Create/Edit Modal */}
      {state.isModalOpen && (
        <div className="fixed inset-0 bg-[#1F2937]/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <h2 className="text-2xl font-black text-[#1F2937] tracking-tight">
                         {state.editingSubject ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
                       </h2>
                       <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Phân bổ môn học vào hệ thống</p>
                    </div>
                    <button onClick={() => actions.setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                       <X size={24} className="text-gray-400" />
                    </button>
                 </div>

                 <form onSubmit={actions.handleSaveSubject} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-3">
                          <label className="text-sm font-black text-[#1F2937] ml-1">Tên môn học</label>
                          <input 
                             type="text"
                             required
                             placeholder="VD: Toán học..."
                             className="w-full px-6 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-4 focus:ring-[#8B5CF6]/10 focus:border-[#8B5CF6] outline-none font-bold transition-all"
                             value={state.formData.name}
                             onChange={(e) => actions.setFormData({ ...state.formData, name: e.target.value })}
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-sm font-black text-[#1F2937] ml-1">Gán vào khối lớp</label>
                          <select 
                             required
                             className="w-full px-6 py-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:ring-4 focus:ring-[#8B5CF6]/10 focus:border-[#8B5CF6] outline-none font-bold transition-all appearance-none"
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
                       <label className="text-sm font-black text-[#1F2937] ml-1">Chọn màu sắc đại diện</label>
                       <div className="flex flex-wrap gap-3 p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl">
                          {PRESET_COLORS.map(color => (
                             <button
                                key={color}
                                type="button"
                                onClick={() => actions.setFormData({ ...state.formData, color })}
                                className={`w-10 h-10 rounded-xl transition-all shadow-md flex items-center justify-center ${state.formData.color === color ? 'ring-4 ring-[#8B5CF6]/30 scale-110' : 'hover:scale-105'}`}
                                style={{ backgroundColor: color }}
                             >
                                {state.formData.color === color && <Check className="text-white" size={18} strokeWidth={3} />}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-black text-[#1F2937] ml-1">Trạng thái phát hành</label>
                        <div className="flex bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-1 gap-1">
                            <button 
                                type="button"
                                onClick={() => actions.setFormData({...state.formData, status: 'DRAFT'})}
                                className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${state.formData.status === 'DRAFT' ? 'bg-white shadow-sm text-[#F59E0B]' : 'text-gray-400'}`}
                            >Bản nháp</button>
                            <button 
                                type="button"
                                onClick={() => actions.setFormData({...state.formData, status: 'PUBLIC'})}
                                className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${state.formData.status === 'PUBLIC' ? 'bg-white shadow-sm text-[#10B981]' : 'text-gray-400'}`}
                            >Công khai</button>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                       <button
                          type="button"
                          onClick={() => actions.setIsModalOpen(false)}
                          className="flex-1 py-4 bg-[#F3F4F6] text-[#4B5563] font-black rounded-[24px] hover:bg-[#E5E7EB] transition-all"
                       >
                          Hủy bỏ
                       </button>
                       <button
                          type="submit"
                          className="flex-3 py-4 bg-[#8B5CF6] text-white font-black rounded-[24px] shadow-lg shadow-purple-500/20 hover:bg-[#7C3AED] transition-all"
                       >
                          {state.editingSubject ? 'Cập nhật môn học' : 'Tạo môn học ngay'}
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
