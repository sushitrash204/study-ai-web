'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import * as documentService from '@/services/documentService';
import { ArrowLeft, Sparkles, Loader2, FileText, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export default function DocumentSummaryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: documentId } = use(params);
    const router = useRouter();
    
    const [summary, setSummary] = useState('');
    const [title, setTitle] = useState('Tài liệu');
    const [sourceLength, setSourceLength] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                // We need to get document title too, but summarizeDocument might not return it
                // Let's assume we fetch it or pass it. For now, we just summarize.
                const result = await documentService.summarizeDocument(documentId);
                setSummary(result.summary);
                setSourceLength(result.sourceLength);
            } catch (error: any) {
                alert('Lỗi: ' + (error?.response?.data?.message || error.message || 'Không thể tóm tắt tài liệu.'));
                router.back();
            } finally {
                setLoading(false);
            }
        })();
    }, [documentId, router]);

    return (
        <main className="flex-1 flex flex-col h-full animate-in fade-in duration-500">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[#EDE9FE] px-4 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                    <button onClick={() => router.back()} className="p-2 hover:bg-[#F3F4F6] rounded-full text-[#6B7280]">
                        <ArrowLeft size={24} strokeWidth={2.5} />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="font-extrabold text-[#1F2937] text-lg">Tóm tắt AI</h1>
                        <p className="text-xs font-bold text-[#8B5CF6] truncate max-w-[200px] md:max-w-md">Phân tích bằng trí tuệ nhân tạo</p>
                    </div>
                </div>
                <div className="w-10" />
            </header>

            <div className="max-w-3xl mx-auto w-full p-4 md:p-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 md:py-32">
                        <div className="bg-white rounded-[32px] p-10 md:p-16 flex flex-col items-center text-center shadow-[0_20px_50px_rgba(139,92,246,0.1)] border border-[#EDE9FE] w-full max-w-lg">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-[#8B5CF6] rounded-full blur-2xl opacity-20 animate-pulse"></div>
                                <div className="relative w-20 h-20 bg-[#F5F3FF] rounded-full flex items-center justify-center">
                                    <Loader2 className="animate-spin text-[#8B5CF6]" size={40} />
                                </div>
                            </div>
                            <h2 className="text-xl font-extrabold text-[#1F2937] mb-3">AI đang phân tích tài liệu...</h2>
                            <p className="text-[#6B7280] font-medium leading-relaxed">
                                Quá trình này có thể mất 15–30 giây tùy thuộc vào độ dài của tài liệu. Vui lòng giữ cửa sổ này mở.
                            </p>
                            <div className="mt-8 flex items-center space-x-2 text-[#8B5CF6] bg-[#F5F3FF] px-4 py-2 rounded-full">
                                <Sparkles size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest">Gemma AI Model</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-2">
                             <div className="flex items-center space-x-2 bg-white border border-[#EDE9FE] px-4 py-2 rounded-full shadow-sm">
                                <Sparkles size={16} className="text-[#8B5CF6]" />
                                <span className="text-xs font-bold text-[#7C3AED]">Tóm tắt bởi Gemma AI</span>
                                {sourceLength > 0 && (
                                    <span className="text-xs font-bold text-[#9CA3AF]"> • {Math.round(sourceLength / 1000)}K ký tự</span>
                                )}
                            </div>
                        </div>

                        <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-6 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                            <div className="prose prose-purple max-w-none">
                                <p className="text-[#1F2937] text-[16px] md:text-[17px] leading-[1.8] font-medium whitespace-pre-wrap">
                                    {summary}
                                </p>
                            </div>
                        </div>

                        <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-2xl p-5 flex items-start space-x-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#8B5CF6] shadow-sm flex-shrink-0">
                                <Info size={20} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-[#5B21B6]">Lưu ý về trí tuệ nhân tạo</p>
                                <p className="text-xs text-[#7C3AED] leading-relaxed opacity-80">
                                    Nội dung tóm tắt được tạo tự động bởi AI. Vui lòng đối chiếu với tài liệu gốc để đảm bảo độ chính xác tuyệt đối trước khi sử dụng cho mục đích học tập.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
