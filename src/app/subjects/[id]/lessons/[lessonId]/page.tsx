'use client';

import React, { useEffect, useMemo, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, FileText, Sparkles, BookOpen, Loader2 } from 'lucide-react';
import MathView from '@/components/common/MathView';
import { LessonModel } from '@/models/Lesson';
import { Exercise } from '@/models/Exercise';
import { Document } from '@/models/Document';
import { ExerciseCard } from '@/components/subject/ExerciseCard';
import * as subjectService from '@/services/subjectService';
import * as exerciseService from '@/services/exerciseService';
import * as documentService from '@/services/documentService';

type LessonBlock = {
    id: string;
    type: 'header' | 'paragraph' | 'image' | 'math' | 'quote' | 'bullet_list' | 'callout' | 'divider';
    data?: {
        text?: string;
        url?: string;
        caption?: string;
        expression?: string;
        author?: string;
        items?: string[];
        tone?: 'info' | 'success' | 'warning';
    };
};

const BlockRenderer = ({ block }: { block: LessonBlock }) => {
    if (block.type === 'header') {
        return (
            <section className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                <h2 className="text-2xl font-black text-[#1F2937] leading-tight">{block.data?.text || 'Tiêu đề'}</h2>
            </section>
        );
    }

    if (block.type === 'image') {
        return (
            <section className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                {block.data?.url ? (
                    <Image
                        src={block.data.url}
                        alt={block.data?.caption || 'Lesson image'}
                        width={1200}
                        height={700}
                        unoptimized
                        className="w-full h-auto rounded-xl border border-[#E5E7EB]"
                    />
                ) : (
                    <div className="w-full h-40 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8] text-sm font-bold">
                        Chưa có URL hình ảnh
                    </div>
                )}
                {block.data?.caption && <p className="mt-2 text-sm text-[#6B7280] font-medium">{block.data.caption}</p>}
            </section>
        );
    }

    if (block.type === 'math') {
        const expr = block.data?.expression || '';
        return (
            <section className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                <MathView content={`$$${expr}$$`} className="text-lg font-bold" />
            </section>
        );
    }

    if (block.type === 'quote') {
        return (
            <section className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                <blockquote className="text-lg text-[#374151] italic font-semibold leading-relaxed">&ldquo;{block.data?.text || 'Trích dẫn'}&rdquo;</blockquote>
                {block.data?.author && <p className="mt-2 text-sm text-[#6B7280] font-bold">- {block.data.author}</p>}
            </section>
        );
    }

    if (block.type === 'bullet_list') {
        const items = Array.isArray(block.data?.items) ? block.data?.items || [] : [];
        return (
            <section className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
                <ul className="space-y-2 list-disc pl-5">
                    {items.length > 0 ? items.map((item, idx) => (
                        <li key={`item-${idx}`} className="text-[#1F2937] font-medium leading-relaxed">{item}</li>
                    )) : <li className="text-[#6B7280] font-medium">Chưa có nội dung danh sách</li>}
                </ul>
            </section>
        );
    }

    if (block.type === 'callout') {
        const tone = block.data?.tone || 'info';
        const toneClass = tone === 'warning'
            ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
            : tone === 'success'
                ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]';
        return (
            <section className={`border rounded-2xl p-5 ${toneClass}`}>
                <MathView content={block.data?.text || 'Nội dung ghi chú'} className="text-[16px] leading-relaxed font-semibold" />
            </section>
        );
    }

    if (block.type === 'divider') {
        return (
            <section className="py-2">
                <div className="h-px bg-[#D1D5DB]" />
            </section>
        );
    }

    return (
        <section className="bg-white border border-[#E5E7EB] rounded-2xl p-5">
            <MathView content={block.data?.text || ''} className="text-[16px] text-[#1F2937] leading-relaxed" />
        </section>
    );
};

const normalizeCompareText = (value?: string) =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');

export default function SubjectLessonDetailPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
    const { id, lessonId } = use(params);
    const router = useRouter();

    const [lesson, setLesson] = useState<LessonModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [relatedExercises, setRelatedExercises] = useState<Exercise[]>([]);
    const [relatedDocuments, setRelatedDocuments] = useState<Document[]>([]);
    const [relatedLoading, setRelatedLoading] = useState(false);

    useEffect(() => {
        subjectService.getLessonDetailBySubject(id, lessonId)
            .then(setLesson)
            .catch(() => setLesson(null))
            .finally(() => setLoading(false));
    }, [id, lessonId]);

    useEffect(() => {
        if (!lesson?.subjectId) {
            return;
        }

        setRelatedLoading(true);
        Promise.all([
            exerciseService.getExercisesBySubject(lesson.subjectId),
            documentService.getDocumentsBySubject(lesson.subjectId),
        ])
            .then(([exercises, documents]) => {
                setRelatedExercises(exercises.filter((exercise) => exercise.lessonId === lesson.id));
                setRelatedDocuments(documents.filter((document) => document.lessonId === lesson.id));
            })
            .catch(() => {
                setRelatedExercises([]);
                setRelatedDocuments([]);
            })
            .finally(() => setRelatedLoading(false));
    }, [lesson]);

    const blocks = useMemo(() => {
        if (!lesson?.content || !Array.isArray(lesson.content)) {
            return [] as LessonBlock[];
        }
        const sourceBlocks = lesson.content as LessonBlock[];
        const lessonTitleNormalized = normalizeCompareText(lesson.title);

        return sourceBlocks.filter((block, index) => {
            // Header page already renders lesson title, skip duplicated first header block title.
            if (index === 0 && block.type === 'header') {
                const blockTitleNormalized = normalizeCompareText(block.data?.text);
                if (blockTitleNormalized && blockTitleNormalized === lessonTitleNormalized) {
                    return false;
                }
            }
            return true;
        });
    }, [lesson]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#F9FAFA] p-6 pt-24">
                <div className="max-w-3xl mx-auto animate-pulse space-y-4">
                    <div className="h-10 bg-white rounded-2xl border border-[#E5E7EB]" />
                    <div className="h-40 bg-white rounded-2xl border border-[#E5E7EB]" />
                </div>
            </main>
        );
    }

    if (!lesson) {
        return (
            <main className="min-h-screen bg-[#F9FAFA] p-6 pt-24">
                <div className="max-w-3xl mx-auto bg-white border border-[#E5E7EB] rounded-2xl p-8 text-center">
                    <h2 className="text-2xl font-black text-[#1F2937]">Không tìm thấy bài học</h2>
                    <p className="text-[#6B7280] mt-2">Bài học có thể đã bị xóa hoặc bạn không có quyền xem.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F9FAFA] p-4 md:p-6 pt-20">
            <div className="max-w-7xl mx-auto space-y-6">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] font-bold"
                >
                    <ArrowLeft size={18} /> Quay lại môn học
                </button>

                <header className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                    <p className="text-xs uppercase tracking-widest font-black text-[#8B5CF6] mb-2">Bài {lesson.order}</p>
                    <h1 className="text-3xl font-black text-[#1F2937] leading-tight">{lesson.title}</h1>
                    {lesson.description && <p className="mt-3 text-[#4B5563] font-medium">{lesson.description}</p>}
                </header>

                <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    <aside className="space-y-4 xl:col-span-3 xl:sticky xl:top-24 order-2 xl:order-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">Bài tập vận dụng</p>
                                <h2 className="text-xl font-black text-[#1F2937] mt-1">Luyện tập theo bài học</h2>
                            </div>
                            {relatedLoading && <Loader2 className="animate-spin text-[#8B5CF6]" size={18} />}
                        </div>

                        {relatedExercises.length === 0 ? (
                            <div className="bg-white border border-dashed border-[#E5E7EB] rounded-2xl p-4 flex items-center gap-3 text-[#6B7280]">
                                <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-[#8B5CF6]">
                                    <BookOpen size={16} />
                                </div>
                                <p className="text-sm font-medium">Chưa có bài tập vận dụng.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {relatedExercises.map((exercise) => (
                                    <ExerciseCard
                                        key={exercise.id}
                                        item={exercise}
                                        onStart={() => router.push(`/exercises/${exercise.id}`)}
                                        onReview={() => router.push(`/exercises/${exercise.id}`)}
                                        onRetry={() => router.push(`/exercises/${exercise.id}`)}
                                        onActionMenu={() => router.push(`/exercises/${exercise.id}`)}
                                    />
                                ))}
                            </div>
                        )}
                    </aside>

                    <div className="space-y-3 order-1 xl:order-2 xl:col-span-6 min-w-0">
                        {blocks.length > 0 ? (
                            blocks.map((block, idx) => (
                                <BlockRenderer key={block.id || `block-${idx}`} block={block} />
                            ))
                        ) : (
                            <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
                                <p className="text-[#6B7280] font-medium">Bài học chưa có nội dung block. Vui lòng cập nhật từ trang admin.</p>
                            </section>
                        )}
                    </div>

                    <aside className="space-y-4 xl:col-span-3 xl:sticky xl:top-24 order-3 min-w-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">Tài liệu tham khảo</p>
                                <h2 className="text-xl font-black text-[#1F2937] mt-1">Tài liệu liên quan</h2>
                            </div>
                            {relatedLoading && <Loader2 className="animate-spin text-[#8B5CF6]" size={18} />}
                        </div>

                        {relatedDocuments.length === 0 ? (
                            <div className="bg-white border border-dashed border-[#E5E7EB] rounded-2xl p-4 flex items-center gap-3 text-[#6B7280]">
                                <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-[#8B5CF6]">
                                    <FileText size={16} />
                                </div>
                                <p className="text-sm font-medium">Chưa có tài liệu tham khảo.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {relatedDocuments.map((doc) => (
                                    <div key={doc.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                                        <div className="space-y-2 min-w-0">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F3FF] text-[#8B5CF6] text-[11px] font-black uppercase tracking-widest">
                                                <FileText size={12} /> Tài liệu
                                            </div>
                                            <h3 className="text-base font-black text-[#1F2937] leading-snug line-clamp-2">{doc.title}</h3>
                                            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest">{doc.displayFileType} • {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('vi-VN') : 'Chưa rõ ngày'}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-3">
                                            <button
                                                onClick={() => router.push(`/documents/${doc.id}/view?url=${encodeURIComponent(doc.fileUrl)}&title=${encodeURIComponent(doc.title)}`)}
                                                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[#E5E7EB] text-[#1F2937] text-xs font-bold hover:bg-[#F9FAFA] transition-all"
                                            >
                                                <FileText size={13} /> Xem
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const requestId = `${doc.id}-${encodeURIComponent(doc.title)}`;
                                                    router.push(`/chat?summaryDocumentId=${doc.id}&summaryTitle=${encodeURIComponent(doc.title)}&summaryRequestId=${requestId}`);
                                                }}
                                                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#8B5CF6] text-white text-xs font-bold hover:bg-[#7C3AED] transition-all"
                                            >
                                                <Sparkles size={13} /> Tóm tắt
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </aside>
                </section>
            </div>
        </main>
    );
}
