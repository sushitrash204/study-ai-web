'use client';

import React from 'react';
import { 
  Plus, 
  GraduationCap, 
  Search, 
  Edit3, 
  Settings2,
  Calendar,
  GripVertical,
  Save,
  RotateCcw
} from 'lucide-react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ClassModel } from '@/models/Class';
import { useAdminClasses } from '@/hooks/admin/useAdminClasses';

// --- Sortable Item Component ---
function SortableRow({ item, columns, onEdit }: { item: ClassModel, columns: any[], onEdit: (item: ClassModel) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 0,
    position: 'relative' as any,
  };

  return (
    <tr 
      ref={setNodeRef} 
      style={style}
      className={`border-b border-[#E5E7EB] last:border-0 transition-colors bg-white ${isDragging ? 'opacity-50 shadow-2xl relative z-50' : ''}`}
    >
      {columns.map((col, i) => (
        <td key={i} className="px-6 py-5">
          <div className="flex items-center space-x-3">
            {i === 0 && (
              <button 
                {...attributes} 
                {...listeners}
                className="p-1 hover:bg-gray-100 rounded text-gray-400 cursor-grab active:cursor-grabbing"
              >
                <GripVertical size={18} />
              </button>
            )}
            <div className="text-[15px] font-bold text-[#1F2937]">
              {col.render ? col.render(item) : (item as any)[col.key]}
            </div>
          </div>
        </td>
      ))}
    </tr>
  );
}

export default function AdminClassesPage() {
  const { state, actions } = useAdminClasses();

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = [
    { 
      key: 'name', 
      header: 'Tên khối lớp',
      render: (item: ClassModel) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#F5F3FF] rounded-xl flex items-center justify-center text-[#8B5CF6]">
            <GraduationCap size={20} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-black tracking-tight">{item.name}</span>
        </div>
      )
    },
    { 
      key: 'description', 
      header: 'Mô tả',
      render: (item: ClassModel) => (
        <span className="text-gray-500 font-medium line-clamp-1">{item.description || 'Không có mô tả'}</span>
      )
    },
    { 
      key: 'createdAt', 
      header: 'Ngày tạo',
      render: (item: ClassModel) => (
        <div className="flex items-center space-x-2 text-gray-400 font-bold text-[13px]">
          <Calendar size={14} />
          <span>{item.getFormattedDate()}</span>
        </div>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (item: ClassModel) => (
        <div className="flex justify-end">
          <button 
            onClick={(e) => { e.stopPropagation(); actions.handleOpenModal(item); }}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-[#8B5CF6]"
          >
            <Edit3 size={18} strokeWidth={2.5} />
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
            <div className="flex items-center space-x-2 text-[#F59E0B]">
                <Settings2 size={20} strokeWidth={2.5} />
                <span className="font-black uppercase tracking-widest text-[11px]">Dữ Liệu Hệ Thống</span>
            </div>
            <h1 className="text-4xl font-black text-[#1F2937] tracking-tight">Quản lý Khối lớp</h1>
            <p className="text-[#6B7280] font-medium text-lg">Cấu trúc các khối lớp từ 1 đến 12.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {state.hasChanges && (
            <>
              <button 
                onClick={actions.handleCancelOrder}
                className="flex items-center justify-center space-x-2 px-6 py-4 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#6B7280] rounded-[24px] font-black transition-all active:scale-95"
              >
                <RotateCcw size={20} strokeWidth={3} />
                <span>Hủy</span>
              </button>
              <button 
                onClick={actions.handleSaveOrder}
                disabled={state.isReordering}
                className="flex items-center justify-center space-x-2 px-6 py-4 bg-[#10B981] hover:bg-[#059669] text-white rounded-[24px] font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <Save size={20} strokeWidth={3} />
                <span>{state.isReordering ? 'Đang lưu...' : 'Lưu thứ tự'}</span>
              </button>
            </>
          )}
          <button 
            onClick={() => actions.handleOpenModal(null)}
            className="flex items-center justify-center space-x-2 px-6 py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-[24px] font-black shadow-lg shadow-purple-500/20 transition-all active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            <span>Thêm Khối lớp</span>
          </button>
        </div>
      </header>

      {/* Table Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm khối lớp..." 
                    className="w-full pl-14 pr-6 py-4 bg-white border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#8B5CF6]/10 focus:border-[#8B5CF6] font-bold transition-all"
                />
            </div>
        </div>

        <div className="w-full bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-sm overflow-x-auto">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={actions.handleDragEnd}
          >
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-[#E5E7EB]">
                  {columns.map((col, i) => (
                    <th key={i} className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#6B7280]">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <SortableContext 
                  items={state.classes.map((c: ClassModel) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {state.classes.map((item) => (
                    <SortableRow 
                      key={item.id} 
                      item={item} 
                      columns={columns} 
                      onEdit={actions.handleOpenModal} 
                    />
                  ))}
                </SortableContext>
                {state.isLoading && [1, 2, 3].map((i: number) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={columns.length} className="px-6 py-8 border-b border-gray-100 bg-gray-50/20"></td>
                  </tr>
                ))}
                {!state.isLoading && state.classes.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-20 text-center text-gray-400 font-bold">
                       Chưa có dữ liệu khối lớp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </DndContext>
        </div>
      </section>

      {/* Modal */}
      {state.isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
          <div className="absolute inset-0 bg-[#1F2937]/40 backdrop-blur-md" onClick={() => actions.setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[36px] shadow-2xl p-8 space-y-8 animate-in zoom-in-95 duration-300">
             <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#1F2937] tracking-tight">
                  {state.editingClass ? 'Cập nhật Khối lớp' : 'Thêm Khối lớp Mới'}
                </h2>
                <p className="text-gray-500 font-medium">Nhập thông tin chi tiết khối lớp hệ thống.</p>
             </div>

             <form onSubmit={actions.handleSubmit} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-sm font-black text-[#1F2937] uppercase tracking-widest pl-1">Tên khối lớp</label>
                   <input 
                      autoFocus
                      type="text" 
                      value={state.formData.name}
                      onChange={(e) => actions.setFormData({...state.formData, name: e.target.value})}
                      placeholder="VD: Lớp 10" 
                      className="w-full px-6 py-4 bg-[#F9FAFA] border border-[#E5E7EB] rounded-2xl focus:outline-none focus:border-[#8B5CF6] font-bold transition-all"
                      required
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-black text-[#1F2937] uppercase tracking-widest pl-1">Mô tả (Tùy chọn)</label>
                   <textarea 
                      rows={3}
                      value={state.formData.description}
                      onChange={(e) => actions.setFormData({...state.formData, description: e.target.value})}
                      placeholder="Thông tin thêm về khối lớp..." 
                      className="w-full px-6 py-4 bg-[#F9FAFA] border border-[#E5E7EB] rounded-2xl focus:outline-none focus:border-[#8B5CF6] font-bold transition-all resize-none"
                   ></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                      type="button"
                      onClick={() => actions.setIsModalOpen(false)}
                      className="flex-1 px-6 py-4 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#1F2937] rounded-2xl font-black transition-all"
                   >
                      Hủy
                   </button>
                   <button 
                      type="submit"
                      disabled={state.isSubmitting}
                      className="flex-1 px-6 py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-2xl font-black shadow-lg shadow-purple-500/20 transition-all active:scale-95 disabled:opacity-50"
                   >
                      {state.isSubmitting ? 'Đang lưu...' : (state.editingClass ? 'Cập nhật' : 'Thêm mới')}
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
