'use client';

import React from 'react';
import { BookOpen, Edit3, Trash2, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SubjectCardProps {
    name: string;
    color: string;
    onClick: () => void;
    onEdit?: (e: React.MouseEvent) => void;
    onDelete?: (e: React.MouseEvent) => void;
    className?: string;
}

export default function SubjectCard({ name, color, onClick, onEdit, onDelete, className }: SubjectCardProps) {
    return (
        <div 
            onClick={onClick}
            style={{ 
                backgroundColor: color,
                boxShadow: `0 4px 14px ${(color || '#000')}40`
            }}
            className={cn(
                "group relative aspect-square md:aspect-[1.4/1] md:min-h-[190px] p-4 md:p-6 rounded-[24px] md:rounded-[28px] hover:-translate-y-2 transition-all duration-500 ease-out cursor-pointer flex flex-col justify-between overflow-hidden border border-white/10 active:scale-[0.98]",
                className
            )}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 20px 40px ${(color || '#000')}60`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 4px 14px ${(color || '#000')}40`;
            }}
        >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-125 group-hover:-rotate-6 transition-all duration-700 ease-out">
                <BookOpen size={120} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="flex items-center justify-between relative z-10 w-full">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-md rounded-[14px] md:rounded-[18px] flex items-center justify-center text-white border border-white/40 shadow-[0_8px_16px_rgba(0,0,0,0.1)] group-hover:animate-float">
                    <BookOpen className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
                </div>
                {(onEdit || onDelete) && (
                    <div className="flex space-x-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform md:-translate-y-2 md:group-hover:translate-y-0">
                        {onEdit && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onEdit(e); }}
                                className="w-9 h-9 flex items-center justify-center bg-white/30 backdrop-blur-md rounded-full text-white hover:bg-white transition-all shadow-sm hover:text-gray-800 active:scale-90"
                            >
                                <Edit3 size={15} strokeWidth={2.5} />
                            </button>
                        )}
                        {onDelete && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(e); }}
                                className="w-9 h-9 flex items-center justify-center bg-white/30 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-all shadow-sm active:scale-90"
                            >
                                <Trash2 size={15} />
                            </button>
                        )}
                    </div>
                )}
            </div>
            
            <div className="relative z-10 w-full transform group-hover:translate-x-1 transition-transform duration-300">
                <h4 className="text-[17px] md:text-[22px] font-extrabold text-white leading-tight drop-shadow-md line-clamp-2">{name}</h4>
                <div className="flex items-center mt-3 text-white/90 font-bold uppercase tracking-[0.15em] text-[10px]">
                    <span>Khóa học tích cực</span>
                    <ChevronRight size={14} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </div>

    );
}
