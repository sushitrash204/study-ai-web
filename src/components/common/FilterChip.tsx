'use client';

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface FilterChipProps {
    label: string;
    selected: boolean;
    onClick: () => void;
    color?: string;
    count?: number;
}

export default function FilterChip({ label, selected, onClick, color, count }: FilterChipProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center space-x-2 px-5 py-2.5 rounded-[14px] text-sm font-bold whitespace-nowrap transition-all border shrink-0",
                selected
                    ? "bg-white text-[#1F2937] border-gray-300 shadow-md"
                    : "bg-white border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937] shadow-sm hover:border-gray-300"
            )}
        >
            {color && (
                <div 
                    className={cn(
                        "w-2.5 h-2.5 rounded-full transition-transform",
                        selected && "scale-125"
                    )} 
                    style={{ backgroundColor: color }} 
                />
            )}
            <span>{label}</span>
            {count !== undefined && (
                <span className={cn(
                    "text-[10px] font-black px-1.5 py-0.5 rounded-full",
                    selected ? "bg-[#8B5CF6] text-white" : "bg-[#F3F4F6] text-[#9CA3AF]"
                )}>
                    {count}
                </span>
            )}
        </button>
    );
}
