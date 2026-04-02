'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSubject } from '@/hooks/subject/useSubject';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, Plus, Search, ChevronRight, FileText } from 'lucide-react';
import Link from 'next/link';
import SubjectCard from '@/components/subject/SubjectCard';
import SubjectEditModal from '@/components/subject/SubjectEditModal';

export default function SubjectListPage() {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const { state: { subjects, isLoading }, actions } = useSubject({ autoFetch: isAuthenticated });
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSubject, setEditingSubject] = useState<any>(null);

    const filteredSubjects = subjects.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddClick = () => {
        setEditingSubject(null);
        setModalVisible(true);
    };

    const handleEditClick = (subject: any) => {
        setEditingSubject(subject);
        setModalVisible(true);
    };

    return (
        <main className="flex-1 flex flex-col px-5 md:px-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500 bg-[#F9FAFA]">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-[#1F2937] tracking-tight">Tất cả môn học</h1>
                    <p className="text-[#6B7280] font-medium text-[14px]">Quản lý các khóa học và tài liệu của bạn</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1 md:w-80 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8E8E93] transition-colors">
                            <Search size={18} strokeWidth={2.5} />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm môn học..."
                            className="w-full bg-[#F2F2F7] border border-[#E5E7EB] text-[#1F2937] pl-11 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] outline-none transition-all font-medium placeholder:text-[#8E8E93]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => router.push('/documents')}
                            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-3 bg-white border border-[#E5E7EB] hover:border-[#8B5CF6]/50 text-[#4B5563] hover:text-[#8B5CF6] rounded-2xl transition-all shadow-sm active:scale-95 shrink-0"
                            title="Thư viện tài liệu"
                        >
                            <FileText size={18} strokeWidth={2.5} />
                            <span className="font-bold text-sm">Tài liệu</span>
                        </button>
                        <button 
                            onClick={handleAddClick}
                            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-2xl transition-all shadow-[0_4px_12px_rgba(139,92,246,0.3)] active:scale-95 shrink-0"
                        >
                            <Plus size={20} strokeWidth={2.5} />
                            <span className="font-bold">Thêm mới</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="aspect-square bg-gray-200/50 animate-pulse rounded-[24px] border border-[#E5E7EB]"></div>
                    ))}
                </div>
            ) : subjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-[#EEF0F4] rounded-[32px]">
                    <div className="w-20 h-20 bg-[#F5F3FF] rounded-3xl flex items-center justify-center mb-6">
                        <BookOpen size={40} className="text-[#8B5CF6]" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-xl font-bold text-[#1F2937] mb-2">Chưa có môn học nào</h2>
                    <p className="text-[#6B7280] font-medium text-center px-4 max-w-md">Bắt đầu hành trình học tập bằng cách tạo môn học đầu tiên để lưu trữ tài liệu và luyện tập cùng AI.</p>
                    <button 
                        onClick={handleAddClick}
                        className="mt-8 px-8 py-4 bg-[#8B5CF6] text-white font-bold rounded-2xl shadow-[0_8px_20px_rgba(139,92,246,0.3)] hover:scale-105 transition-transform active:scale-95"
                    >
                        Tạo môn học ngay
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredSubjects.map((subject) => (
                        <SubjectCard
                            key={subject.id}
                            name={subject.name}
                            color={subject.color}
                            onClick={() => router.push(`/subjects/${subject.id}`)}
                            onEdit={() => handleEditClick(subject)}
                            onDelete={() => actions.handleDeleteSubject(subject)}
                        />
                    ))}
                </div>
            )}

            <SubjectEditModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={(name: string, color: string) => actions.handleSaveSubject(name, color, editingSubject)}
                initialName={editingSubject?.name}
                initialColor={editingSubject?.color}
                title={editingSubject ? 'Sửa môn học' : 'Thêm môn học mới'}
            />
        </main>
    );
}
