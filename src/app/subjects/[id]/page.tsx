'use client';

import React, { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSubjectDetail } from '@/hooks/subject/useSubjectDetail';
import { useSubjects } from '@/hooks/subject/useSubjects';
import { ExerciseCard } from '@/components/subject/ExerciseCard';
import GenerateExerciseModal from '@/components/library/GenerateExerciseModal';
import { 
    ArrowLeft, 
    Sparkles, 
    Loader2, 
    FileText, 
    Target,
    BookOpen,
    MoreVertical
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// NextJS app router passes params as a Promise in page components
export default function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const { state: subState, actions: subActions } = useSubjects();
    const subject = subState.subjects.find(s => s.id === id);
    const subjectName = subject?.name || 'Chi tiết môn học';
    const subjectColor = subject?.color || '#8B5CF6';

    const { state, actions } = useSubjectDetail(id);

    const handleSubjectSettings = () => {
        if (!subject) return;
        const choice = window.confirm(`Cài đặt cho môn "${subjectName}":\n\nOK: Đổi tên môn học\nCancel: Xóa môn học\n(Hoặc nhấn X để đóng)`);
        
        if (choice) {
            const newName = window.prompt('Nhập tên mới cho môn học:', subjectName);
            if (newName && newName !== subjectName) {
                subActions.handleSave(newName, subjectColor, null, subject);
            }
        } else {
            const reallyDelete = window.confirm(`Bạn có chắc chắn muốn xóa môn "${subjectName}" không?`);
            if (reallyDelete) {
                subActions.handleDelete(subject).then(success => {
                    if (success) router.push('/');
                });
            }
        }
    };

    const {
        exercises,
        loading,
        refreshing,
        genModalVisible,
        pdfDocs,
        selectedDocId,
        genType,
        genCount,
        genDifficulty,
        generating
    } = state;

    useEffect(() => {
        actions.fetchExercises();
    }, [actions.fetchExercises]);

    const completedCount = exercises.filter(e => e.status === 'COMPLETED').length;
    const totalCount = exercises.length;
    const progressPerc = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <main className="flex-1 flex flex-col h-full animate-in fade-in duration-500 bg-[#F9FAFA]">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white border-b border-[#F3F4F6] px-4 py-4 md:px-6 md:py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => router.back()} 
                        className="p-1.5 hover:bg-[#F3F4F6] rounded-full text-[#1F2937] transition-colors"
                    >
                        <ArrowLeft size={24} strokeWidth={2.5} />
                    </button>
                    <h1 className="text-xl md:text-2xl font-bold text-[#1F2937] tracking-tight truncate max-w-[200px] md:max-w-md">
                        {subjectName}
                    </h1>
                </div>

                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => router.push('/documents')}
                        className="hidden md:flex items-center space-x-2 px-4 py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] rounded-xl text-sm font-bold transition-all"
                    >
                        <FileText size={18} />
                        <span>Thư viện</span>
                    </button>
                    <button 
                        onClick={handleSubjectSettings}
                        className="p-2.5 hover:bg-[#F3F4F6] rounded-xl text-[#9CA3AF] transition-colors"
                    >
                        <MoreVertical size={24} />
                    </button>
                </div>
            </header>

            <div className="flex-1 max-w-4xl mx-auto w-full p-5 md:p-6 space-y-6">
                {/* Progress Section */}
                <section className="bg-white p-5 rounded-[20px] border border-[#EEF0F4] shadow-sm">
                    <h2 className="text-[14px] font-bold uppercase tracking-widest text-[#8B5CF6] mb-4">Tiến độ học tập</h2>

                    <div className="flex items-end justify-between mb-5">
                        <div className="space-y-1">
                            <p className="text-[14px] text-[#6B7280]">
                                Tổng số bài học: <span className="font-bold text-[#1F2937]">{totalCount}</span>
                            </p>
                            <p className="text-[14px] text-[#6B7280]">
                                Đã hoàn thành: <span className="font-bold text-[#1F2937]">{completedCount} ({progressPerc}%)</span>
                            </p>
                        </div>
                        <div className="text-[32px] font-bold text-[#1F2937] leading-none tracking-tight">
                            {progressPerc}%
                        </div>
                    </div>

                    <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${progressPerc}%`, backgroundColor: '#8B5CF6' }} 
                        />
                    </div>
                </section>

                {/* Exercises List */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-[20px] font-bold text-[#1F2937]">Danh sách bộ đề</h2>
                        {refreshing && <Loader2 className="animate-spin text-[#8E8E93]" size={16} />}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                            <Loader2 className="animate-spin text-[#8B5CF6] mb-4" size={32} />
                            <p className="text-[#6B7280] font-medium">Đang tải bộ đề...</p>
                        </div>
                    ) : exercises.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-[#EEF0F4] rounded-[32px]">
                            <div className="w-16 h-16 bg-[#F5F3FF] rounded-[20px] flex items-center justify-center text-[#8B5CF6] mb-6">
                                <BookOpen size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-bold text-[#1F2937] mb-2">Chưa có bài tập nào</h3>
                            <p className="text-[#6B7280] text-center text-sm px-8 max-w-sm">Tạo bộ đề đầu tiên bằng công nghệ AI từ tài liệu PDF của bạn.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {exercises.map(ex => (
                                <ExerciseCard
                                    key={ex.id}
                                    item={ex}
                                    onStart={() => actions.openExerciseDetail(ex.id, 'start')}
                                    onReview={() => actions.openExerciseDetail(ex.id, 'review')}
                                    onRetry={() => actions.openExerciseDetail(ex.id, 'retry')}
                                    onActionMenu={() => actions.openExerciseActionMenu(ex)}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Floating Action Button (FAB) */}
            <button
                onClick={actions.openGenModal}
                className="fixed bottom-[calc(92px+env(safe-area-inset-bottom))] right-6 md:bottom-10 md:right-10 w-16 h-16 rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_12px_25px_rgba(139,92,246,0.4)] hover:-translate-y-1 transition-all z-20 active:scale-95 bg-[#8B5CF6]"
            >
                <Sparkles size={28} strokeWidth={2} />
            </button>

            <GenerateExerciseModal
                visible={genModalVisible}
                onClose={() => actions.setGenModalVisible(false)}
                pdfDocs={pdfDocs}
                selectedDocId={selectedDocId}
                onSelectDoc={actions.setSelectedDocId}
                genType={genType}
                onSetGenType={actions.setGenType}
                genCount={genCount}
                onSetGenCount={actions.setGenCount}
                genDifficulty={genDifficulty}
                onSetGenDifficulty={actions.setGenDifficulty}
                onGenerate={actions.handleGenerateExercise}
                generating={generating}
                subjectColor={subjectColor}
            />
        </main>
    );
}
