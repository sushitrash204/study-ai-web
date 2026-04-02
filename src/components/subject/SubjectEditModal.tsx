'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Palette, Type, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const PRESET_COLORS = [
    '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', 
    '#F59E0B', '#EF4444', '#6366F1', '#14B8A6'
];

interface SubjectEditModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (name: string, color: string) => Promise<boolean>;
    initialName?: string;
    initialColor?: string;
    title?: string;
}

export default function SubjectEditModal({ 
    visible, 
    onClose, 
    onSave, 
    initialName = '', 
    initialColor = '#8B5CF6',
    title = 'Thêm môn học mới'
}: SubjectEditModalProps) {
    const [name, setName] = useState(initialName);
    const [color, setColor] = useState(initialColor);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setName(initialName);
            setColor(initialColor);
        }
    }, [visible, initialName, initialColor]);

    if (!visible) return null;

    const handleSave = async () => {
        if (!name.trim()) return;
        setLoading(true);
        const success = await onSave(name, color);
        setLoading(false);
        if (success) onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-[#E5E7EB] w-full max-w-md rounded-[32px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-in zoom-in duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-extrabold text-[#1F2937] tracking-tight">{title}</h3>
                    <button onClick={onClose} className="p-2.5 hover:bg-[#F2F2F7] rounded-full text-[#6B7280]">
                        <X size={20} strokeWidth={2.5}/>
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest px-1 flex items-center">
                            <Type size={14} className="mr-2" /> Tên môn học
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập tên môn học..."
                            className="w-full bg-[#F9FAFB] border border-[#E5E7EB] text-[#1F2937] px-5 py-4 rounded-2xl focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] outline-none transition-all font-medium"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-widest px-1 flex items-center">
                            <Palette size={14} className="mr-2" /> Chọn màu sắc chủ đạo
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={cn(
                                        "h-12 rounded-xl transition-all flex items-center justify-center border-4 border-transparent",
                                        color === c && "border-white shadow-md scale-110"
                                    )}
                                    style={{ backgroundColor: c }}
                                >
                                    {color === c && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading || !name.trim()}
                        className="w-full flex items-center justify-center space-x-2 py-4 mt-4 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#D1D5DB] text-white font-bold rounded-[20px] transition-all shadow-[0_8px_20px_rgba(139,92,246,0.25)] active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /><span>Lưu môn học</span></>}
                    </button>
                </div>
            </div>
        </div>
    );
}
