'use client';

import React, { useEffect, useState, use, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, Sparkles, Loader2 } from 'lucide-react';

export default function PDFViewerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: documentId } = use(params);
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const url = searchParams.get('url');
    const title = searchParams.get('title') || 'Tài liệu';

    const [loading, setLoading] = useState(true);
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [zoom, setZoom] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const pdfDocRef = useRef<any>(null);

    useEffect(() => {
        if (!url) {
            alert('Không tìm thấy đường dẫn tài liệu');
            router.back();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
        script.onload = () => {
            const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

            pdfjsLib.getDocument(url).promise.then((pdf: any) => {
                pdfDocRef.current = pdf;
                setNumPages(pdf.numPages);
                renderPage(1, zoom);
                setLoading(false);
            }).catch((err: any) => {
                console.error(err);
                setLoading(false);
            });
        };
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, [url, router]);

    const renderPage = async (pageNo: number, scale: number) => {
        if (!pdfDocRef.current || !containerRef.current) return;

        const page = await pdfDocRef.current.getPage(pageNo);
        const viewport = page.getViewport({ scale });
        
        // Use a canvas to render
        let canvas = containerRef.current.querySelector('canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            containerRef.current.appendChild(canvas);
        }

        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        await page.render(renderContext).promise;
        setCurrentPage(pageNo);
    };

    const handleZoomIn = () => {
        const newZoom = Math.min(zoom + 0.25, 3);
        setZoom(newZoom);
        renderPage(currentPage, newZoom);
    };

    const handleZoomOut = () => {
        const newZoom = Math.max(zoom - 0.25, 0.5);
        setZoom(newZoom);
        renderPage(currentPage, newZoom);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            renderPage(currentPage - 1, zoom);
        }
    };

    const handleNextPage = () => {
        if (currentPage < numPages) {
            renderPage(currentPage + 1, zoom);
        }
    };

    return (
        <main className="flex-1 flex flex-col h-full animate-in fade-in duration-500 overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center space-x-3">
                    <button onClick={() => router.back()} className="p-2 hover:bg-[#F3F4F6] rounded-full text-[#1F2937]">
                        <ArrowLeft size={22} strokeWidth={2.5} />
                    </button>
                    <div className="hidden md:block">
                        <h1 className="font-bold text-[#1F2937] text-sm truncate max-w-xs">{title}</h1>
                        <p className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">Tài liệu học tập</p>
                    </div>
                </div>

                {/* PDF Controls */}
                <div className="flex items-center bg-[#F3F4F6] rounded-xl px-2 py-1 space-x-1">
                    <button 
                        onClick={handleZoomOut}
                        disabled={loading}
                        className="p-1.5 hover:bg-white rounded-lg text-[#6B7280] disabled:opacity-30 transition-colors"
                    >
                        <ZoomOut size={18} />
                    </button>
                    <span className="text-xs font-bold text-[#1F2937] w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <button 
                        onClick={handleZoomIn}
                        disabled={loading}
                        className="p-1.5 hover:bg-white rounded-lg text-[#6B7280] disabled:opacity-30 transition-colors"
                    >
                        <ZoomIn size={18} />
                    </button>
                </div>

                <button 
                    onClick={() => window.open(url!, '_blank')}
                    className="flex items-center space-x-2 bg-[#8B5CF6] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-[#7C3AED] transition-all"
                >
                    <Download size={16} />
                    <span className="hidden sm:inline">Tải về</span>
                </button>
            </header>

            {/* Viewer Content */}
            <main className="flex-1 overflow-auto p-4 flex justify-center items-start">
                <div className="relative">
                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F3F4F6] z-10 py-20">
                            <Loader2 className="animate-spin text-[#8B5CF6] mb-4" size={40} />
                            <p className="text-sm font-bold text-[#6B7280]">Đang tải tài liệu...</p>
                        </div>
                    )}
                    <div 
                        ref={containerRef} 
                        className="bg-white shadow-2xl rounded-sm overflow-hidden min-h-[500px] min-w-[300px]"
                    >
                        {/* Canvas will be injected here */}
                    </div>
                </div>
            </main>

            {/* Bottom Nav */}
            <footer className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-[#E5E7EB] rounded-2xl px-6 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.1)] flex items-center space-x-6 z-30">
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={handlePrevPage}
                        disabled={loading || currentPage === 1}
                        className="p-2 hover:bg-[#F3F4F6] rounded-full text-[#1F2937] disabled:opacity-30"
                    >
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="flex items-center space-x-1 text-sm font-bold">
                        <span className="text-[#8B5CF6]">{currentPage}</span>
                        <span className="text-[#9CA3AF]">/</span>
                        <span className="text-[#1F2937]">{numPages || '--'}</span>
                    </div>
                    <button 
                        onClick={handleNextPage}
                        disabled={loading || currentPage === numPages}
                        className="p-2 hover:bg-[#F3F4F6] rounded-full text-[#1F2937] disabled:opacity-30"
                    >
                        <ChevronRight size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="h-6 w-[1px] bg-[#E5E7EB]"></div>

                <button 
                    onClick={() => router.push(`/chat?documentId=${documentId}&title=${encodeURIComponent(title)}`)}
                    className="flex items-center space-x-2 text-[#8B5CF6] hover:bg-[#F5F3FF] px-3 py-2 rounded-xl transition-colors"
                >
                    <Sparkles size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">Hỏi AI</span>
                </button>
            </footer>
        </main>
    );
}
