'use client';

import React from 'react';
import { FileText, MoreVertical, Sparkles, Layers, ExternalLink } from 'lucide-react';
import { Document } from '@/models/Document';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface DocumentCardProps {
    item: Document;
    onPress: () => void;
    onActionMenu: (e: React.MouseEvent) => void;
    onSummary: (e: React.MouseEvent) => void;
    onGenerate: (e: React.MouseEvent) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
    item,
    onPress,
    onActionMenu,
    onSummary,
    onGenerate
}) => {
    const isPdf = (item.fileType || '').toLowerCase() === 'pdf';

    return (
        <div className="group relative bg-white border border-[#E5E7EB] hover:border-[#8B5CF6]/50 rounded-[24px] p-6 transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 flex flex-col">
            <div className="flex items-start justify-between mb-5">
                <div onClick={onPress} className="w-12 h-12 bg-[#F5F3FF] rounded-2xl flex items-center justify-center text-[#8B5CF6] border border-[#8B5CF6]/20 group-hover:scale-110 transition-transform cursor-pointer">
                    <FileText size={24} strokeWidth={2} />
                </div>
                <button 
                    onClick={onActionMenu}
                    className="p-2 text-[#9CA3AF] hover:text-[#1F2937] hover:bg-[#F3F4F6] rounded-xl transition-all"
                >
                    <MoreVertical size={18} />
                </button>
            </div>
            
            <div onClick={onPress} className="space-y-2 mb-6 min-h-[4rem] cursor-pointer">
                <h4 className="text-[17px] font-bold text-[#1F2937] leading-tight line-clamp-2 decoration-[#8B5CF6] group-hover:text-[#8B5CF6] transition-colors">
                    {item.title}
                </h4>
                <p className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-widest mt-2">
                    {item.fileType?.toUpperCase()} • {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'Chưa rõ ngày'}
                </p>
            </div>

            {isPdf ? (
                <div className="flex items-center justify-between pt-4 border-t border-[#F3F4F6] gap-2 mt-auto">
                    <button 
                        onClick={onSummary}
                        className="flex-1 flex items-center justify-center space-x-1.5 text-xs font-bold text-[#8B5CF6] hover:text-[#7C3AED] transition-colors bg-[#F5F3FF] py-2.5 rounded-xl border border-[#8B5CF6]/10"
                    >
                        <Sparkles size={14} className="animate-pulse" />
                        <span>Tóm tắt</span>
                    </button>
                    
                    <button 
                        onClick={onGenerate}
                        className="flex-1 flex items-center justify-center space-x-1.5 text-xs font-bold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] transition-colors py-2.5 rounded-xl shadow-sm"
                    >
                        <Layers size={14} />
                        <span>Tạo đề</span>
                    </button>
                </div>
            ) : (
                <div className="pt-4 border-t border-[#F3F4F6] mt-auto">
                    <button 
                        onClick={() => window.open(item.fileUrl, '_blank')}
                        className="w-full flex items-center justify-center space-x-2 text-xs font-bold text-[#6B7280] bg-[#F3F4F6] hover:bg-[#E5E7EB] py-2.5 rounded-xl transition-all"
                    >
                        <ExternalLink size={14} />
                        <span>Mở tài liệu</span>
                    </button>
                </div>
            )}
        </div>
    );
};
