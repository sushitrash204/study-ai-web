'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useSubjects } from '@/hooks/subject/useSubjects';
import { 
  Plus, 
  Search, 
  BookOpen,
  Sparkles,
  Target,
  GraduationCap,
  ArrowRight,
  Zap,
  Layers,
  Award
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

    useEffect(() => {
        if (!isInitializing && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isInitializing, router]);

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

    if (isInitializing || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Header Area */}
            <div className="bg-white border-b border-gray-100 pt-16 pb-6 sticky top-0 z-30 shadow-sm shadow-gray-200/5">
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                Thư viện môn học
                                <div className="px-2.5 py-1 bg-indigo-50 rounded-lg">
                                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest leading-none">Library</span>
                                </div>
                            </h1>
                            <p className="text-gray-400 font-bold text-sm">Khám phá và quản lý lộ trình học tập của bạn.</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative group flex-1 md:flex-none">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm môn học nhanh..." 
                                    className="pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl w-full md:w-80 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all text-sm font-bold shadow-inner"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={handleAddClick}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all shadow-lg shadow-indigo-200 active:scale-95 text-sm font-black whitespace-nowrap"
                            >
                                <Plus size={18} strokeWidth={3} />
                                <span>Thêm môn học</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-2">
                        {/* Tab Toggle - Premium Style */}
                        <div className="flex items-center p-1 bg-gray-100/80 rounded-2xl w-full md:w-fit">
                            {[
                                { id: 'SYSTEM', label: 'Chương trình phổ thông', icon: GraduationCap },
                                { id: 'PERSONAL', label: 'Tủ sách cá nhân', icon: User }
                            ].map((tab: any) => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all flex-1 md:flex-none whitespace-nowrap ${
                                        activeTab === tab.id 
                                        ? 'bg-white text-indigo-600 shadow-xl' 
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <tab.icon size={14} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Grade Pills */}
                        {activeTab === 'SYSTEM' && (
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 w-full md:max-w-xl">
                                <button
                                    onClick={() => setSelectedClassId('INTRO')}
                                    className={`px-5 py-2.5 rounded-full text-xs font-black transition-all whitespace-nowrap border-2 ${
                                        selectedClassId === 'INTRO' 
                                        ? 'bg-gray-900 border-gray-900 text-white shadow-lg' 
                                        : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200 hover:text-indigo-600'
                                    }`}
                                >
                                    Tất cả
                                </button>
                                {subState.classes.map((cls) => (
                                    <button
                                        key={cls.id}
                                        onClick={() => setSelectedClassId(cls.id)}
                                        className={`px-5 py-2.5 rounded-full text-xs font-black transition-all whitespace-nowrap border-2 ${
                                            selectedClassId === cls.id 
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                                            : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200 hover:text-indigo-600'
                                        }`}
                                    >
                                        {cls.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 md:px-8 mt-4">
                
                {selectedClassId === 'INTRO' && activeTab === 'SYSTEM' ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Synchronized Compact Hero Banner */}
                        <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-r from-[#DCD7FF] via-[#E2E8FF] to-[#F1F4FF] p-10 md:p-12 text-gray-900 shadow-xl border border-white/50 group">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            
                            <div className="relative z-10 flex items-center justify-between gap-8">
                                <div className="max-w-xl space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-md rounded-lg border border-white/40">
                                        <Sparkles size={14} className="text-indigo-600" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#6366F1]">Lưới học tập thông minh</span>
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
                                        Kiến thức chuẩn <br/> <span className="text-indigo-600/80">BGD&ĐT 2026.</span>
                                    </h2>
                                    <p className="text-base text-gray-500 font-bold leading-relaxed max-w-md">
                                        Lộ trình học tập được tối ưu hóa cho mục tiêu của bạn.
                                    </p>
                                    <button 
                                        onClick={() => setSelectedClassId(subState.classes[0]?.id || null)} 
                                        className="px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-black hover:scale-105 transition-all shadow-xl text-sm flex items-center gap-3 group/btn hover:bg-black"
                                    >
                                        Bắt đầu học ngay
                                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                                
                                <div className="hidden lg:block relative w-48 h-48 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                                    <GraduationCap size={180} strokeWidth={1} className="text-indigo-900" />
                                </div>
                            </div>
                        </div>

                        {/* No Pillar Cards here to save space */}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Subjects Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {subState.isLoading ? (
                                [1, 2, 3, 4, 5, 8, 9, 10].map(i => (
                                    <div key={i} className="aspect-[4/3] bg-gray-100 animate-pulse rounded-[32px]"></div>
                                ))
                            ) : filteredSubjects.length > 0 ? (
                                filteredSubjects.map((subject) => (
                                    <div key={subject.id} onContextMenu={(e) => { e.preventDefault(); handleEditClick(subject); }}>
                                        <SubjectCard
                                            name={subject.name}
                                            className={activeTab === 'SYSTEM' ? undefined : (subject.class?.name || "Tùy chỉnh")}
                                            color={subject.color}
                                            onClick={() => router.push(`/subjects/${subject.id}`)}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-24 text-center bg-white border-2 border-dashed border-gray-100 rounded-[48px]">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <BookOpen size={40} className="text-gray-200" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-400">
                                        {activeTab === 'PERSONAL' ? 'Tủ sách cá nhân đang trống' : 'Không tìm thấy môn học nào'}
                                    </h3>
                                    <p className="text-gray-300 font-bold mt-2">Hãy thử thay đổi khối học hoặc từ khóa tìm kiếm.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
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

// Mock User Icon for tab
const User = ({ size, className }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);
