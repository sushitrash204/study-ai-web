'use client';

import React from 'react';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

interface ClozeReviewDetailProps {
    type: 'CLOZE_MCQ' | 'CLOZE_TEXT';
    picked: any;
    correctAnswer: any;
    options?: any;
    compact?: boolean;
}

const ClozeReviewDetail: React.FC<ClozeReviewDetailProps> = ({ 
    type, 
    picked, 
    correctAnswer, 
    options, 
    compact = false 
}) => {
    // Normalization logic
    const clean = (s: any) => String(s || '').trim().toLowerCase().normalize('NFC').replace(/[.,!?;:]+$/, '');
    
    const uArr = Array.isArray(picked) ? picked : (picked ? [picked] : []);
    let cArr: any[] = [];
    try {
        cArr = Array.isArray(correctAnswer) ? correctAnswer : JSON.parse(String(correctAnswer || '[]'));
    } catch {
        cArr = String(correctAnswer || '').split(',').map(s => s.trim());
    }

    return (
        <div className={cn(
            "mt-3 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[24px] overflow-hidden",
            compact && "mt-2 p-3"
        )}>
            <p className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.1em] mb-4">CHI TIẾT ĐÁP ÁN:</p>
            
            <div className="space-y-4">
                {cArr.map((cAns, ci) => {
                    const userVal = uArr[ci];
                    const isValid = clean(userVal) === clean(cAns) && String(userVal || '').trim() !== '';
                    
                    return (
                        <div key={ci} className={cn(
                            "pb-4 border-b border-[#E2E8F0] last:border-0 last:pb-0",
                            compact && "pb-3"
                        )}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center flex-1 space-x-3">
                                    <div className="w-6 h-6 rounded-lg bg-[#E2E8F0] flex items-center justify-center flex-shrink-0">
                                        <span className="text-[10px] font-black text-[#475569]">{ci + 1}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center">
                                        <span className={cn(
                                            "text-base font-bold",
                                            isValid ? "text-[#059669]" : "text-[#DC2626]"
                                        )}>
                                            {userVal || <span className="italic font-normal opacity-40">(Bỏ trống)</span>}
                                        </span>
                                        {!isValid && (
                                            <>
                                                <ArrowRight size={14} className="mx-2 text-[#94A3B8]" />
                                                <span className="text-base font-bold text-[#1E293B]">{cAns}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {isValid ? (
                                    <CheckCircle2 size={18} className="text-[#10B981] flex-shrink-0" />
                                ) : (
                                    <XCircle size={18} className="text-[#EF4444] flex-shrink-0" />
                                )}
                            </div>

                            {/* Option list for CLOZE_MCQ */}
                            {type === 'CLOZE_MCQ' && options && options[ci] && (
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 pl-9">
                                    {(options[ci] as string[]).map((o, oi) => {
                                        const isOCorrect = clean(o) === clean(cAns);
                                        return (
                                            <span 
                                                key={oi} 
                                                className={cn(
                                                    "text-[10px] uppercase font-bold tracking-wider",
                                                    isOCorrect ? "text-[#059669]" : "text-[#94A3B8]"
                                                )}
                                            >
                                                {OPTION_LABELS[oi]}. {o}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default React.memo(ClozeReviewDetail);
