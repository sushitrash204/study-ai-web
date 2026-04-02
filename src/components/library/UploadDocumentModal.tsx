'use client';

import React from 'react';
import { X, Upload, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { Subject } from '@/models/Subject';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface UploadDocumentModalProps {
    visible: boolean;
    onClose: () => void;
    subjects: Subject[];
    selectedSubjectId: string | null;
    onSelectSubject: (id: string) => void;
    customTitle: string;
    onSetCustomTitle: (title: string) => void;
    onUpload: (file: File) => void;
    isUploading: boolean;
}

export default function UploadDocumentModal({
    visible,
    onClose,
    subjects,
    selectedSubjectId,
    onSelectSubject,
    customTitle,
    onSetCustomTitle,
    onUpload,
    isUploading
}: UploadDocumentModalProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    if (!visible) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-[#E5E7EB] w-full max-w-md rounded-[32px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in zoom-in duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-extrabold text-[#1F2937] tracking-tight">Tải lên tài liệu</h3>
                    <button onClick={onClose} className="p-2.5 hover:bg-[#F2F2F7] rounded-full text-[#6B7280]">
                        <X size={20} strokeWidth={2.5}/>
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest px-1">Chọn môn học</label>
                        <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin">
                            {subjects.map(s => (
                                <button 
                                    key={s.id}
                                    onClick={() => onSelectSubject(s.id)}
                                    className={cn(
                                        "px-4 py-3 rounded-[14px] border text-sm font-bold transition-all flex items-center space-x-3 text-left",
                                        selectedSubjectId === s.id 
                                            ? "bg-[#F5F3FF] border-[#8B5CF6] text-[#8B5CF6] shadow-sm" 
                                            : "bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6]"
                                    )}
                                >
                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }}></div>
                                    <span className="truncate">{s.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest px-1">Tiêu đề (Tùy chọn)</label>
                        <input 
                            type="text" 
                            placeholder="Nhập tiêu đề hoặc để mặc định..."
                            className="w-full bg-[#F2F2F7] border border-[#E5E7EB] text-[#1F2937] px-4 py-3.5 rounded-2xl focus:ring-2 focus:ring-[#8B5CF6]/50 outline-none transition-all font-medium placeholder:text-[#8E8E93]"
                            value={customTitle}
                            onChange={(e) => onSetCustomTitle(e.target.value)}
                        />
                    </div>

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                    />

                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!selectedSubjectId || isUploading}
                        className="w-full flex items-center justify-center space-x-2 py-4 mt-4 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#D1D5DB] disabled:shadow-none text-white font-bold rounded-[16px] transition-all shadow-[0_8px_20px_rgba(139,92,246,0.25)] active:scale-95"
                    >
                        {isUploading ? <Loader2 className="animate-spin" size={20}/> : <Upload size={20} strokeWidth={2.5}/>}
                        <span>{isUploading ? 'Đang tải lên...' : 'Chọn từ thiết bị'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
