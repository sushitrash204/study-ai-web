'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useSubjects } from '@/hooks/subject/useSubjects';
import { 
  Plus, 
  Search, 
  BookOpen,
  LayoutDashboard,
  Sparkles,
  Target,
  GraduationCap,
  Info
} from 'lucide-react';
import SubjectCard from '@/components/subject/SubjectCard';
import SubjectEditModal from '@/components/subject/SubjectEditModal';

export default function SubjectListPage() {
    const { isAuthenticated, isInitializing } = useAuthStore();
    const router = useRouter();

    const [selectedClassId, setSelectedClassId] = useState<string | 'INTRO' | null>('INTRO');
    const [activeTab, setActiveTab] = useState<'PERSONAL' | 'SYSTEM'>('SYSTEM');
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSubject, setEditingSubject] = useState<any>(null);

    const { state: subState, actions: subActions } = useSubjects({ 
        type: 'BOTH', 
        autoFetch: isAuthenticated,
        classId: selectedClassId === 'INTRO' ? null : selectedClassId 
    });

    const gradeListRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const checkScrollArrows = useCallback(() => {
        if (!gradeListRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = gradeListRef.current;
        setShowLeftArrow(scrollLeft > 5);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }, []);

    useEffect(() => {
        checkScrollArrows();
        window.addEventListener('resize', checkScrollArrows);
        return () => window.removeEventListener('resize', checkScrollArrows);
    }, [checkScrollArrows, subState.classes, activeTab]);

    const handleAddClick = () => {
        setEditingSubject(null);
        setModalVisible(true);
    };

    const handleEditClick = (subject: any) => {
        setEditingSubject(subject);
        setModalVisible(true);
    };

    const handleSaveSubject = async (name: string, color: string, classId: string | null) => {
        const targetClassId = activeTab === 'SYSTEM' ? classId : null;
        const success = await subActions.handleSave(name, color, targetClassId, editingSubject);
        if (success) setModalVisible(false);
        return success;
    };

    const subjectsToShow = activeTab === 'PERSONAL' ? subState.subjects : subState.systemSubjects;
    const filteredSubjects = subjectsToShow.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (!isInitializing && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isInitializing, router]);

    if (isInitializing || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FAFA] p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section Compact */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Thư viện môn học</h1>
                        <div className="flex items-center gap-1.5 bg-gray-100/60 p-1 rounded-xl w-fit">
                            <button 
                                onClick={() => setActiveTab('PERSONAL')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'PERSONAL' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Cá nhân
                            </button>
                            <button 
                                onClick={() => setActiveTab('SYSTEM')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'SYSTEM' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Hệ thống
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group flex-1 md:flex-none">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder="Tìm môn học..." 
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl w-full md:w-64 focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500 transition-all text-sm font-bold"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleAddClick}
                            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all shadow-md active:scale-95 text-sm font-black"
                        >
                            <Plus size={18} strokeWidth={3} />
                            <span>Thêm môn</span>
                        </button>
                    </div>
                </div>

                {/* Grade Selector Compact */}
                {activeTab === 'SYSTEM' && (
                    <div className="relative pt-2">
                        <div ref={gradeListRef} onScroll={checkScrollArrows} className="flex gap-2.5 overflow-x-auto no-scrollbar scroll-smooth pb-1">
                            <button
                                onClick={() => setSelectedClassId('INTRO')}
                                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 transition-all min-w-max ${
                                    selectedClassId === 'INTRO' 
                                    ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white shadow-md' 
                                    : 'bg-white border-gray-100 text-gray-500 hover:border-violet-100 hover:bg-violet-50/50'
                                }`}
                            >
                                <Sparkles size={16} />
                                <span className="font-black text-xs uppercase tracking-wider">Giới thiệu</span>
                            </button>

                            {subState.classes.map((cls) => (
                                <button
                                    key={cls.id}
                                    onClick={() => setSelectedClassId(cls.id)}
                                    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 transition-all min-w-max ${
                                        selectedClassId === cls.id 
                                        ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white shadow-md' 
                                        : 'bg-white border-gray-100 text-gray-500 hover:border-violet-100 hover:bg-violet-50/50'
                                    }`}
                                >
                                    <BookOpen size={16} />
                                    <span className="font-black text-xs uppercase tracking-wider">{cls.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content Area Compact */}
                <div className="pt-2">
                    {selectedClassId === 'INTRO' && activeTab === 'SYSTEM' ? (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Hero Section Compact */}
                            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-violet-600 to-indigo-700 p-8 md:p-12 text-white shadow-xl">
                                <div className="absolute top-0 right-0 p-8 opacity-5 blur-sm transform translate-x-10 -translate-y-10">
                                    <GraduationCap size={240} strokeWidth={1} />
                                </div>
                                <div className="relative z-10 max-w-xl space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-md text-[10px] font-black uppercase tracking-widest">
                                        <Target size={12} />
                                        Chuẩn BGD&ĐT 2026
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black leading-tight">Tương lai bắt đầu từ hôm nay.</h2>
                                    <p className="text-lg text-white/80 font-medium leading-snug">
                                        AI Study Hub cung cấp lộ trình học tập tối ưu từ lớp 1 đến lớp 12.
                                    </p>
                                    <button 
                                        onClick={() => setSelectedClassId(subState.classes[0]?.id || null)} 
                                        className="px-6 py-3 bg-white text-violet-600 rounded-xl font-black hover:scale-105 transition-transform text-sm shadow-lg mt-2"
                                    >
                                        Bắt đầu khám phá
                                    </button>
                                </div>
                            </div>

                            {/* Info Grid Compact */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex-shrink-0 flex items-center justify-center">
                                        <Info size={24} className="text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 text-sm mb-1">Khối lớp chuyên sâu</h3>
                                        <p className="text-gray-500 font-bold text-xs leading-relaxed">Được thiết kế riêng theo từng cấp độ học thuật.</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
                                    <div className="w-12 h-12 bg-violet-50 rounded-xl flex-shrink-0 flex items-center justify-center">
                                        <Sparkles size={24} className="text-violet-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 text-sm mb-1">Hỗ trợ bởi AI</h3>
                                        <p className="text-gray-500 font-bold text-xs leading-relaxed">Phân tích và gợi ý tài liệu học tập chính xác.</p>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex-shrink-0 flex items-center justify-center">
                                        <LayoutDashboard size={24} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-gray-900 text-sm mb-1">Theo dõi tiến độ</h3>
                                        <p className="text-gray-500 font-bold text-xs leading-relaxed">Báo cáo kết quả chi tiết từng môn học.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 animate-in fade-in duration-300">
                            {subState.isLoading ? (
                                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                                    <div key={i} className="aspect-[4/3] bg-white animate-pulse rounded-2xl border border-gray-50 shadow-sm"></div>
                                ))
                            ) : filteredSubjects.length > 0 ? (
                                filteredSubjects.map((subject) => (
                                    <div key={subject.id} onContextMenu={(e) => { e.preventDefault(); handleEditClick(subject); }}>
                                        <SubjectCard
                                            name={subject.name}
                                            className={activeTab === 'SYSTEM' ? undefined : subject.class?.name}
                                            color={subject.color}
                                            onClick={() => router.push(`/subjects/${subject.id}`)}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-16 text-center bg-white border-2 border-dashed border-gray-100 rounded-[32px]">
                                    <BookOpen size={48} className="text-gray-200 mx-auto mb-3" />
                                    <h3 className="text-lg font-bold text-gray-500">
                                        {activeTab === 'PERSONAL' ? 'Tủ sách cá nhân đang trống' : 'Không tìm thấy môn học nào'}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1">Hãy thử chọn khối học khác để bắt đầu.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <SubjectEditModal 
                key={`${modalVisible ? 'open' : 'closed'}-${editingSubject?.id || 'new'}`}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveSubject}
                initialName={editingSubject?.name}
                initialColor={editingSubject?.color}
                initialClassId={editingSubject?.classId}
                classes={subState.classes}
                title={editingSubject ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
                allowClassSelection={activeTab === 'SYSTEM'}
            />
        </div>
    );
}
