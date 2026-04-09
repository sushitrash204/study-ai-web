import React from 'react';
import { BarChart3, Edit2, Play, RotateCcw, Eye } from 'lucide-react';
import { Exercise } from '@/models/Exercise';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ExerciseCardProps {
    item: Exercise;
    onStart: () => void;
    onReview: () => void;
    onRetry: () => void;
    onActionMenu: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
    item,
    onStart,
    onReview,
    onRetry,
    onActionMenu,
}) => {
    const isQuiz = item.isQuiz;
    const isCompleted = item.isCompleted;
    const compactDescription = String(item.description || 'Chưa có mô tả').replace(/\s+/g, ' ').trim();
    const latestSubmission = item.latestSubmission;
    const scoreText = item.formattedScore;
    const correctCount = latestSubmission?.correctCount ?? 0;
    const wrongCount = latestSubmission?.wrongCount ?? 0;
    const totalCount = latestSubmission?.totalCount ?? 0;
    const correctRatio = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
    const displayWrongCount = Math.max(totalCount - correctCount, 0);
    const wrongRatio = totalCount > 0 ? (displayWrongCount / totalCount) * 100 : 0;
    const submittedTimeText = item.formattedSubmissionTime;

    const showQuizStats = !!(isCompleted && isQuiz && latestSubmission && scoreText !== null);
    const showEssayDone = !!(isCompleted && !isQuiz && latestSubmission);

    return (
        <div className="bg-white p-4 rounded-[20px] mb-4 border border-[#EEF0F4] shadow-[0_4px_10px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col group">
            <div className="flex items-center justify-between mb-3">
                <div className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider",
                    item.type === 'QUIZ' ? "bg-[#EDE9FE] text-[#6D28D9]" :
                    item.type === 'MIXED' ? "bg-[#ECFDF5] text-[#059669]" :
                    "bg-[#DBEAFE] text-[#1D4ED8]"
                )}>
                    {item.type === 'QUIZ' ? 'Trắc nghiệm' : item.type === 'MIXED' ? 'Tổng hợp' : 'Tự luận'}
                </div>
                <div className={cn(
                    "text-[11px] font-bold px-3 py-1.5 rounded-full",
                    isCompleted ? "text-[#059669] bg-[#D1FAE5]" : "text-[#6B7280] bg-[#F3F4F6]"
                )}>
                    {isCompleted ? 'Đã làm' : 'Chưa làm'}
                </div>
            </div>

            <div className="mb-4 flex-1">
                <h3 className="text-[17px] font-extrabold text-[#1F2937] mb-2 leading-snug group-hover:text-[#8B5CF6] transition-colors">{item.title}</h3>
                <p className="text-[13px] text-[#6B7280] line-clamp-2 leading-relaxed">{compactDescription}</p>

                {showQuizStats && (
                    <div className="mt-4 p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center bg-[#F5F3FF] px-2.5 py-1.5 rounded-full shadow-sm border border-[#8B5CF6]/20">
                                <BarChart3 size={14} className="text-[#8B5CF6]" />
                                <span className="ml-1.5 text-xs font-bold text-[#6D28D9]">Điểm {scoreText}/10</span>
                            </div>
                            <span className="text-xs font-bold text-[#4B5563]">Tổng {totalCount} câu</span>
                        </div>

                        <div className="h-2 rounded-full overflow-hidden flex bg-[#E5E7EB] mb-2">
                            <div className="h-full bg-[#10B981]" style={{ width: `${Math.max(correctRatio, 0)}%` }} />
                            <div className="h-full bg-[#EF4444]" style={{ width: `${Math.max(wrongRatio, 0)}%` }} />
                        </div>

                        <div className="flex justify-between items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold text-[#059669]">Đúng {correctCount}</span>
                            <span className="text-[11px] font-bold text-[#DC2626]">Sai {displayWrongCount}</span>
                        </div>

                        {submittedTimeText && (
                            <p className="mt-2 text-[11px] font-semibold text-[#8E8E93]">Nộp lúc {submittedTimeText}</p>
                        )}
                    </div>
                )}

                {showEssayDone && (
                    <div className="mt-4 p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                        {scoreText !== null ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center bg-[#F5F3FF] px-2.5 py-1.5 rounded-full shadow-sm border border-[#8B5CF6]/20">
                                    <BarChart3 size={14} className="text-[#8B5CF6]" />
                                    <span className="ml-1.5 text-xs font-bold text-[#6D28D9]">Điểm {scoreText}/10</span>
                                </div>
                                <span className="text-xs font-bold text-[#4B5563]">Tổng {totalCount} câu</span>
                            </div>
                        ) : (
                            <span className="text-sm font-bold text-[#059669]">Đã nộp bài tự luận</span>
                        )}
                        {submittedTimeText && (
                            <p className="mt-2 text-[11px] font-semibold text-[#8E8E93]">Nộp lúc {submittedTimeText}</p>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-end border-t border-[#F3F4F6] pt-4 mt-auto">
                <div className="flex items-center space-x-2">
                    {isCompleted ? (
                        <>
                            <button
                                onClick={onReview}
                                className="flex items-center space-x-1.5 px-4 py-2 bg-white border border-[#E5E7EB] text-[#8B5CF6] hover:bg-[#F5F3FF] hover:border-[#8B5CF6]/30 font-bold text-sm rounded-xl transition-all"
                            >
                                <Eye size={16} />
                                <span>Xem lại</span>
                            </button>
                            <button
                                onClick={onRetry}
                                className="flex items-center space-x-1.5 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#8B5CF6]/20 active:scale-95"
                            >
                                <RotateCcw size={16} />
                                <span>Làm lại</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onStart}
                            className="flex items-center space-x-1.5 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-[#8B5CF6]/20 active:scale-95"
                        >
                            <Play size={16} fill="currentColor" />
                            <span>Bắt đầu</span>
                        </button>
                    )}

                    <button
                        onClick={onActionMenu}
                        className="w-9 h-9 flex items-center justify-center bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] hover:text-[#1F2937] rounded-xl transition-colors ml-1"
                    >
                        <Edit2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
