'use client';

import React from 'react';
import { X, Sparkles, Loader2, FileText } from 'lucide-react';
import { Document } from '@/models/Document';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GenerateExerciseModalProps {
    visible: boolean;
    onClose: () => void;
    pdfDocs: Document[];
    selectedDocId: string | null;
    onSelectDoc: (id: string) => void;
    genType: 'QUIZ' | 'ESSAY' | 'MIXED';
    onSetGenType: (type: 'QUIZ' | 'ESSAY' | 'MIXED') => void;
    genCount: number;
    onSetGenCount: (count: number) => void;
    genDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
    onSetGenDifficulty: (diff: 'EASY' | 'MEDIUM' | 'HARD') => void;
    onGenerate: () => void;
    generating: boolean;
    subjectColor: string;
}

export default function GenerateExerciseModal({
    visible,
    onClose,
    pdfDocs,
    selectedDocId,
    onSelectDoc,
    genType,
    onSetGenType,
    genCount,
    onSetGenCount,
    genDifficulty,
    onSetGenDifficulty,
    onGenerate,
    generating,
    subjectColor
}: GenerateExerciseModalProps) {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-[#E5E7EB] w-full max-w-lg rounded-[32px] p-6 lg:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in zoom-in duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl md:text-2xl font-extrabold text-[#1F2937] tracking-tight">Tạo bộ đề từ PDF</h3>
                    <button onClick={onClose} className="p-2 hover:bg-[#F2F2F7] rounded-full text-[#6B7280]">
                        <X size={24} strokeWidth={2.5}/>
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[60vh] md:max-h-[500px] pr-2 space-y-6 scrollbar-thin">
                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest px-1">Chọn tài liệu PDF</label>
                        {pdfDocs.length === 0 ? (
                            <div className="p-4 bg-[#FFF7ED] border border-[#FDE68A] rounded-2xl">
                                <p className="text-sm font-medium text-[#B45309]">Chưa có tài liệu PDF nào. Vui lòng quay lại Thư viện để tải lên.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-thin">
                                {pdfDocs.map(doc => (
                                    <button
                                        key={doc.id}
                                        onClick={() => onSelectDoc(doc.id)}
                                        className={cn(
                                            "w-full flex items-center px-4 py-3 rounded-[16px] border text-sm font-semibold transition-all text-left",
                                            selectedDocId === doc.id
                                                ? "bg-[#F5F3FF] border-[#8B5CF6] text-[#8B5CF6] shadow-sm"
                                                : "bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6]"
                                        )}
                                    >
                                        <FileText size={18} className="mr-3 opacity-80" />
                                        <span className="truncate flex-1">{doc.title}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest px-1">Loại bộ đề</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { val: 'QUIZ', label: 'Trắc nghiệm' },
                                { val: 'ESSAY', label: 'Tự luận' },
                                { val: 'MIXED', label: 'Tổng hợp' }
                            ].map(t => (
                                <button
                                    key={t.val}
                                    onClick={() => onSetGenType(t.val as any)}
                                    className={cn(
                                        "py-3 px-2 rounded-[16px] border text-xs md:text-sm font-bold transition-all text-center",
                                        genType === t.val
                                            ? "bg-[#8B5CF6] border-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30"
                                            : "bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]"
                                    )}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest">Số lượng câu</label>
                            <span className="text-sm font-black text-[#8B5CF6]">{genCount}</span>
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                            {[5, 10, 20, 25, 30, 40].map(n => (
                                <button
                                    key={n}
                                    onClick={() => onSetGenCount(n)}
                                    className={cn(
                                        "py-2.5 rounded-[12px] border text-sm font-bold transition-all",
                                        genCount === n
                                            ? "bg-[#8B5CF6] border-[#8B5CF6] text-white shadow-md"
                                            : "bg-[#F3F4F6] border-transparent text-[#4B5563] hover:bg-[#E5E7EB]"
                                    )}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest px-1">Độ khó</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { val: 'EASY', label: 'Dễ', color: '#10B981' },
                                { val: 'MEDIUM', label: 'Trung bình', color: '#D97706' },
                                { val: 'HARD', label: 'Khó', color: '#DC2626' }
                            ].map(d => (
                                <button
                                    key={d.val}
                                    onClick={() => onSetGenDifficulty(d.val as any)}
                                    className={cn(
                                        "py-3 px-2 rounded-[16px] border text-xs md:text-sm font-bold transition-all text-center border-transparent shadow-sm",
                                        genDifficulty === d.val ? "text-white" : "bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280]"
                                    )}
                                    style={genDifficulty === d.val ? { backgroundColor: d.color, boxShadow: `0 4px 12px ${d.color}40` } : {}}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-4 bg-[#F2F2F7] hover:bg-[#E5E7EB] text-[#4B5563] font-bold rounded-[16px] transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onGenerate}
                        disabled={generating || pdfDocs.length === 0}
                        className="flex-1 flex items-center justify-center space-x-2 py-4 disabled:opacity-50 text-white font-bold rounded-[16px] transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5"
                        style={{ backgroundColor: subjectColor }}
                    >
                        {generating ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={20} /><span>Tạo bộ đề</span></>}
                    </button>
                </div>
            </div>
        </div>
    );
}
