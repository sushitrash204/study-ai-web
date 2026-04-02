'use client';

import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import MathView from '../common/MathView';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface MCQReviewDetailProps {
    content: string;
    options: string[];
    correctAnswer: string;
    picked: string | null;
}

const MCQReviewDetail: React.FC<MCQReviewDetailProps> = ({ 
    content, 
    options, 
    correctAnswer, 
    picked 
}) => {
    return (
        <div className="mt-1">
            <div className="mb-5">
                <MathView content={content} className="text-[17px] font-bold leading-relaxed" />
            </div>
            
            <div className="space-y-3">
                {(options ?? []).map((opt, oi) => {
                    const isSelected = picked === opt;
                    const isCorrect = opt === correctAnswer;
                    
                    return (
                        <div
                            key={oi}
                            className={cn(
                                "flex items-center p-4 rounded-2xl border transition-all duration-300",
                                isCorrect 
                                    ? "bg-[#ECFDF5] border-[#10B981] shadow-sm shadow-[#10B981]/10" 
                                    : isSelected 
                                        ? "bg-[#FEF2F2] border-[#EF4444] shadow-sm shadow-[#EF4444]/10" 
                                        : "bg-[#F9FAFB] border-[#E5E7EB]"
                            )}
                        >
                            <div className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center mr-4 text-xs font-black transition-colors shrink-0",
                                isSelected ? "bg-[#8B5CF6] text-white" : "bg-white border border-[#E5E7EB] text-[#64748B]"
                            )}>
                                {OPTION_LABELS[oi] || '?'}
                            </div>
                            
                            <div className="flex-1">
                                <MathView 
                                    content={opt} 
                                    isUser={false} 
                                    inline 
                                    className={cn(
                                        "text-sm font-medium",
                                        isSelected ? "text-[#1F2937]" : "text-[#4B5563]"
                                    )} 
                                />
                            </div>
                            
                            {isCorrect && <CheckCircle2 size={20} className="text-[#10B981] ml-2 shrink-0" />}
                            {!isCorrect && isSelected && <XCircle size={20} className="text-[#EF4444] ml-2 shrink-0" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default React.memo(MCQReviewDetail);
