'use client';

import React from 'react';
import { 
  FileText, 
  MoreVertical, 
  Sparkles, 
  Layers, 
  Clock,
  Trash2,
  Edit3
} from 'lucide-react';
import { Document } from '@/models/Document';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface DocumentCardProps {
    item: Document;
    onPress: () => void;
    onActionMenu: (e: React.MouseEvent, action?: 'RENAME' | 'DELETE') => void;
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
    const [showMenu, setShowMenu] = React.useState(false);

    return (
        <div className="group relative bg-white rounded-[32px] p-6 transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)] flex flex-col h-full border border-gray-100 hover:border-indigo-200">
            {/* Top Row: Icon & Menu */}
            <div className="flex items-start justify-between mb-6">
                <div 
                    onClick={onPress}
                    className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-105 cursor-pointer"
                >
                    <FileText size={22} strokeWidth={2.5} />
                </div>
                
                <div className="relative">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="p-1.5 text-gray-300 hover:text-gray-900 transition-colors"
                    >
                        <MoreVertical size={20} />
                    </button>

                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
                            <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(false);
                                        onActionMenu(e, 'RENAME');
                                    }}
                                    className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Edit3 size={16} className="text-indigo-600" />
                                    <span>Đổi tên</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(false);
                                        onActionMenu(e, 'DELETE');
                                    }}
                                    className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-gray-50"
                                >
                                    <Trash2 size={16} />
                                    <span>Xóa tài liệu</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            
            {/* Title & Meta */}
            <div onClick={onPress} className="space-y-2 mb-6 cursor-pointer flex-1">
                <h4 className="text-[17px] font-black text-gray-900 leading-[1.4] group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {item.title}
                </h4>
                <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-gray-100 rounded-md text-[9px] font-black text-gray-500 uppercase tracking-widest">
                        {item.fileType?.toUpperCase() || 'PDF'}
                    </span>
                    <span className="text-gray-400 font-bold text-[11px]">
                        {new Date(item.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2.5">
                <button 
                    onClick={onSummary}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-3 bg-indigo-50 text-indigo-600 rounded-[18px] font-black text-[12px] hover:bg-indigo-100 transition-all active:scale-95"
                >
                    <Sparkles size={14} fill="currentColor" />
                    <span>Tóm tắt</span>
                </button>
                
                <button 
                    onClick={onGenerate}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-3 bg-indigo-600 text-white rounded-[18px] font-black text-[12px] shadow-sm hover:bg-indigo-700 transition-all active:scale-95"
                >
                    <Layers size={14} />
                    <span>Tạo đề</span>
                </button>
            </div>
        </div>
    );
};
