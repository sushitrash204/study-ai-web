'use client';

import React from 'react';
import {
  Plus,
  GraduationCap,
  Search,
  Edit3,
  GripVertical,
  Save,
  RotateCcw,
  X
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
import { AdminCard, AdminStatCard } from '@/components/admin/common/AdminCard';
import { useAdminClasses } from '@/hooks/admin/useAdminClasses';

// --- Sortable Item Component ---
function SortableCard({ item, onEdit }: { item: ClassModel; onEdit: (item: ClassModel) => void }) {
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white rounded-[32px] border border-white shadow-sm p-6
        flex items-center gap-4 hover:shadow-lg transition-all
        ${isDragging ? 'opacity-50 shadow-2xl ring-2 ring-violet-600' : ''}
      `}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 cursor-grab active:cursor-grabbing shrink-0"
      >
        <GripVertical size={20} />
      </button>

      <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
        <GraduationCap size={28} className="text-violet-600" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-lg font-black text-gray-900 tracking-tight">{item.name}</h4>
        {item.description && (
          <p className="text-sm text-gray-500 font-medium mt-1 line-clamp-1">{item.description}</p>
        )}
        <p className="text-xs text-gray-400 font-bold mt-2">
          {item.getFormattedDate()}
        </p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onEdit(item); }}
        className="p-3 hover:bg-violet-50 rounded-xl transition-all text-gray-400 hover:text-violet-600 shrink-0"
      >
        <Edit3 size={20} strokeWidth={2.5} />
      </button>
    </div>
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

  return (
    <div className="min-h-screen bg-[#F3F5F9] pb-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-600">
              <GraduationCap size={18} strokeWidth={2.5} />
              <span className="font-black uppercase tracking-widest text-[10px]">Dữ liệu phổ thông</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Quản lý Khối lớp</h1>
            <p className="text-gray-500 font-medium text-lg">Cấu trúc các khối lớp từ 1 đến 12.</p>
          </div>

          <div className="flex items-center gap-3">
            {state.hasChanges && (
              <>
                <button
                  onClick={actions.handleCancelOrder}
                  className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-2xl font-black transition-all active:scale-95"
                >
                  <RotateCcw size={20} strokeWidth={3} />
                  <span>Hủy</span>
                </button>
                <button
                  onClick={actions.handleSaveOrder}
                  disabled={state.isReordering}
                  className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl font-black shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Save size={20} strokeWidth={3} />
                  <span>{state.isReordering ? 'Đang lưu...' : 'Lưu thứ tự'}</span>
                </button>
              </>
            )}
            <button
              onClick={() => actions.handleOpenModal(null)}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-violet-200 hover:shadow-xl hover:scale-105 transition-all active:scale-95"
            >
              <Plus size={20} strokeWidth={3} />
              <span>Thêm Khối lớp</span>
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AdminStatCard
            label="Tổng khối lớp"
            value={state.classes.length}
            icon={GraduationCap}
            color="violet"
          />
        </section>

        {/* Search */}
        <AdminCard hoverable={false} className="mb-8">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm khối lớp..."
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 font-bold transition-all"
            />
          </div>
        </AdminCard>

        {/* Classes Grid with DnD */}
        {state.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white h-[160px] rounded-[32px] animate-pulse border border-white" />
            ))}
          </div>
        ) : state.classes.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={actions.handleDragEnd}
          >
            <SortableContext
              items={state.classes.map((c: ClassModel) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.classes.map((item) => (
                  <SortableCard
                    key={item.id}
                    item={item}
                    onEdit={actions.handleOpenModal}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <AdminCard hoverable={false}>
            <div className="py-16 text-center">
              <GraduationCap size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-black text-lg">Chưa có khối lớp nào.</p>
              <p className="text-gray-400 font-medium text-sm mt-2">Hãy tạo khối lớp đầu tiên!</p>
            </div>
          </AdminCard>
        )}

        {/* Modal */}
        {state.isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => actions.setIsModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-lg rounded-[36px] shadow-2xl p-8 space-y-8 animate-in zoom-in-95 duration-300">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  {state.editingClass ? 'Cập nhật Khối lớp' : 'Thêm Khối lớp mới'}
                </h2>
                <p className="text-gray-500 font-medium">Nhập thông tin chi tiết khối lớp đào tạo.</p>
              </div>

              <form onSubmit={actions.handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-black text-gray-900 uppercase tracking-widest pl-1">Tên khối lớp</label>
                  <input
                    autoFocus
                    type="text"
                    value={state.formData.name}
                    onChange={(e) => actions.setFormData({...state.formData, name: e.target.value})}
                    placeholder="VD: Lớp 10"
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 font-bold transition-all"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-gray-900 uppercase tracking-widest pl-1">Mô tả (Tùy chọn)</label>
                  <textarea
                    rows={3}
                    value={state.formData.description}
                    onChange={(e) => actions.setFormData({...state.formData, description: e.target.value})}
                    placeholder="Thông tin thêm về khối lớp..."
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 font-bold transition-all resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => actions.setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-black transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={state.isSubmitting}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-violet-200 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {state.isSubmitting ? 'Đang lưu...' : (state.editingClass ? 'Cập nhật' : 'Thêm mới')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
