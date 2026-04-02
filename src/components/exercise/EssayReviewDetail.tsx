'use client';

import React from 'react';
import { User, Lightbulb, CheckCircle2 } from 'lucide-react';
import MathView from '../common/MathView';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface EssayReviewDetailProps {
    content: string;
    picked: string | null;
    evaluation?: {
        feedback: string;
        aiAnswer: string;
        score: number;
        maxPoints: number;
    } | null;
}

const EssayReviewDetail: React.FC<EssayReviewDetailProps> = ({ 
    content, 
    picked, 
    evaluation 
}) => {
    return (
        <div className="mt-1 space-y-6">
            <MathView content={content} className="text-[17px] font-bold leading-relaxed mb-6" />
            
            <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
                <div className="flex items-center mb-3 space-x-2">
                    <User size={16} className="text-[#64748B]" />
                    <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">BÀI LÀM CỦA BẠN:</span>
                </div>
                <div className="text-[#1E293B] text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {picked || <span className="text-[#94A3B8] italic">(Để trống)</span>}
                </div>
            </div>

            {evaluation && (
                <div className="bg-[#EFF6FF] rounded-2xl p-5 border-2 border-[#DBEAFE] shadow-sm space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Lightbulb size={16} className="text-[#2563EB]" />
                            <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-widest">PHẢN HỒI TỪ AI:</span>
                        </div>
                        <div className="text-[#1E40AF] text-sm leading-relaxed font-semibold">
                            {evaluation.feedback}
                        </div>
                    </div>
                    
                    <div className="h-[1px] bg-[#DBEAFE] w-full" />
                    
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <CheckCircle2 size={16} className="text-[#059669]" />
                            <span className="text-[10px] font-black text-[#059669] uppercase tracking-widest">GỢI Ý ĐÁP ÁN:</span>
                        </div>
                        <div className="text-[#047857] text-sm leading-relaxed font-medium">
                            <MathView content={evaluation.aiAnswer} inline className="text-[#047857]" />
                        </div>
                    </div>
                    
                    {evaluation.score !== undefined && (
                        <div className="pt-2 flex justify-end">
                            <div className="bg-white/50 px-3 py-1 rounded-full text-xs font-black text-[#1E40AF] border border-[#DBEAFE]">
                                Điểm: {evaluation.score}/{evaluation.maxPoints}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default React.memo(EssayReviewDetail);
