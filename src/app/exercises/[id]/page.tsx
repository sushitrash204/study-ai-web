'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useExercise } from '@/hooks/exercise/useExercise';
import { useExerciseSession } from '@/hooks/exercise/useExerciseSession';
import { useExerciseResult } from '@/hooks/exercise/useExerciseResult';
import { Exercise } from '@/models/Exercise';
import { Question } from '@/models/Question';
import {
    ArrowLeft, Loader2, ChevronLeft, ChevronRight,
    RotateCcw, Check, X, Minus, Sparkles, CheckCircle2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import MathView from '@/components/common/MathView';
import MCQReviewDetail from '@/components/exercise/MCQReviewDetail';
import EssayReviewDetail from '@/components/exercise/EssayReviewDetail';
import ClozeReviewDetail from '@/components/exercise/ClozeReviewDetail';
import AudioPlayer from '@/components/exercise/AudioPlayer';
import ShareResultModal from '@/components/exercise/ShareResultModal';
import { Share2 } from 'lucide-react';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

const shuffleArray = <T,>(arr: T[]): T[] => {
    const s = [...arr];
    for (let i = s.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [s[i], s[j]] = [s[j], s[i]];
    }
    return s;
};

const randomizeQuestions = (qs: Question[]) =>
    shuffleArray(qs).map(q => {
        const plain = { ...q };
        if (Array.isArray(q.options)) {
            plain.options = shuffleArray(q.options);
        }
        return new Question(plain);
    });

const extractAudioTag = (text: string) => {
    const tagMatch = text.match(/\[AUDIO:([a-z-]+)\]([\s\S]*?)\[\/AUDIO\]/i);
    if (!tagMatch) return { cleanText: text, audioScript: null, audioLang: null };
    const lang = tagMatch[1] || 'en';
    const script = tagMatch[2].trim();
    const cleanText = text.replace(/\[AUDIO:([a-z-]+)\]([\s\S]*?)\[\/AUDIO\]/gi, '').trim();
    return { cleanText: cleanText, audioScript: script, audioLang: lang };
};

export default function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: exerciseId } = use(params);
    const searchParams = useSearchParams();
    const entryAction = searchParams.get('action') || 'start';
    const isReviewMode = entryAction === 'review';

    const router = useRouter();
    const { actions: exActions } = useExercise();

    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [loading, setLoading] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);

    const { state: session, actions: sessionActions } = useExerciseSession(exercise);
    const {
        currentIndex,
        userAnswers,
        essayAnswers,
        submitted,
        submitting,
        essayEvaluation,
        questions,
    } = session;

    const results = useExerciseResult(session, sessionActions);

    useEffect(() => {
        setLoading(true);
        sessionActions.resetSession();
        (async () => {
            try {
                const data = await exActions.fetchExerciseDetail(exerciseId);
                if (!data) { router.back(); return; }

                const latestSubmission = data.submissionHistory?.[0];
                if (isReviewMode && !latestSubmission) {
                    alert('Bài này chưa có lần nộp nào để xem lại.');
                    router.back();
                    return;
                }

                if (data.type === 'QUIZ' && !isReviewMode) {
                    data.questions = randomizeQuestions(data.questions ?? []);
                }
                setExercise(data);

                if (isReviewMode && latestSubmission) {
                    const answerMap: Record<string, any> = {};
                    latestSubmission.answers?.forEach((ans: any) => {
                        if (ans.questionId) answerMap[ans.questionId] = ans.parsedContent;
                    });
                    sessionActions.setUserAnswers(answerMap);
                    sessionActions.setSubmitted(true);
                    if (latestSubmission.essayEvaluation) {
                        sessionActions.setEssayEvaluation(latestSubmission.essayEvaluation);
                    }
                    sessionActions.setBackendResult(latestSubmission);
                }
            } catch {
                router.back();
            } finally {
                setLoading(false);
            }
        })();
    }, [exerciseId, entryAction]);

    const formatPt = (v: number) => v.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

    const handleBackNavigation = () => {
        if (exercise?.lessonId && exercise?.subjectId) {
            router.push(`/subjects/${exercise.subjectId}/lessons/${exercise.lessonId}`);
            return;
        }
        router.back();
    };

    const handleSubmit = async () => {
        const unanswered = questions.filter(q => !userAnswers[q.id] && !essayAnswers[q.id]).length;
        if (unanswered > 0) {
            if (!window.confirm(`Bạn còn ${unanswered} câu chưa trả lời. Vẫn nộp bài?`)) return;
        }
        await sessionActions.submit();
    };

    // ── Loading ──────────────────────────────────────
    if (loading) {
        return (
            <main className="flex-1 flex flex-col items-center justify-center h-full">
                <Loader2 className="animate-spin text-[#8B5CF6] mb-4" size={40} />
                <p className="text-[#6B7280] font-semibold">Đang tải bài tập...</p>
            </main>
        );
    }

    if (!exercise) return null;

    const isQuizType = exercise.type === 'QUIZ' || exercise.type === 'MIXED';
    const isEssayType = exercise.type === 'ESSAY';
    const currentQ = questions[currentIndex];
    const progressPct = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
    const answeredCount = questions.filter(q => userAnswers[q.id] || essayAnswers[q.id]).length;

    // ── Result Screen ────────────────────────────────
    if (submitted) {
        const { correctCount, total, scoreOnTen, wrongCount, pct, passed, ratioCorrect, ratioWrong, performance, scoreChips } = results;
        const scoreText = formatPt(scoreOnTen);

        return (
            <main className="flex-1 flex flex-col h-full animate-in fade-in duration-500 overflow-hidden font-sans">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] px-4 py-4 flex items-center justify-between shadow-sm">
                    <button onClick={handleBackNavigation} className="p-2 hover:bg-[#F3F4F6] rounded-full text-[#6B7280]">
                        <ArrowLeft size={24} strokeWidth={2.5} />
                    </button>
                    <h1 className="font-extrabold text-[#1F2937] text-lg">Kết quả</h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="p-2 hover:bg-[#F5F3FF] rounded-full text-[#8B5CF6]"
                            title="Chia sẻ kết quả"
                        >
                            <Share2 size={20} strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={() => { sessionActions.resetSession(); setLoading(true); window.location.reload(); }}
                            className="p-2 hover:bg-[#F5F3FF] rounded-full text-[#8B5CF6]"
                        >
                            <RotateCcw size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full p-4 md:p-8 space-y-6 pb-24">
                    {/* Score Hero */}
                    <div className="relative bg-white border-2 rounded-[28px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden"
                        style={{ borderColor: performance.accent }}>
                        <div className="absolute top-4 right-4 w-24 h-24 rounded-full opacity-20" style={{ backgroundColor: performance.accentSoft }} />
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: performance.accentSoft }}>
                                <Sparkles size={24} style={{ color: performance.accent }} />
                            </div>
                            <p className="text-lg font-extrabold mb-2" style={{ color: performance.accentText }}>{performance.title}</p>
                            <div className="flex items-end space-x-1">
                                <span className="text-6xl font-black leading-none tracking-tighter" style={{ color: performance.accent }}>{scoreText}</span>
                                <span className="text-3xl text-[#94A3B8] font-bold leading-none mb-1">/10</span>
                            </div>
                            <p className="text-sm font-semibold text-[#475569] mt-2">Tương đương {pct}% • Đúng {correctCount}/{total}</p>
                            <p className="text-sm text-[#475569] mt-2 leading-relaxed max-w-xs">{performance.message}</p>

                            <div className="grid grid-cols-2 gap-3 mt-6 w-full">
                                {scoreChips.map(chip => (
                                    <div key={chip.label} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-4 py-3">
                                        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{chip.label}</p>
                                        <p className="text-xl font-black" style={{ color: chip.tone }}>{chip.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Distribution */}
                    {total > 0 && (
                        <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-5 md:p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-extrabold text-[#0F172A] text-lg">Tỷ lệ đúng / sai</h3>
                                <span className={cn("text-xs font-bold px-3 py-1.5 rounded-full", passed ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#FEE2E2] text-[#DC2626]")}>
                                    {passed ? 'Đạt yêu cầu' : 'Cần cải thiện'}
                                </span>
                            </div>
                            <div className="h-4 bg-[#F1F5F9] rounded-full overflow-hidden flex mb-3">
                                <div className="h-full bg-[#10B981] transition-all" style={{ width: `${Math.max(ratioCorrect, 0)}%` }} />
                                <div className="h-full bg-[#EF4444] transition-all" style={{ width: `${Math.max(ratioWrong, 0)}%` }} />
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <span className="flex items-center text-sm font-bold text-[#065F46]"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981] mr-2" />Đúng {correctCount}</span>
                                <span className="flex items-center text-sm font-bold text-[#991B1B]"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] mr-2" />Sai {wrongCount}</span>
                            </div>
                        </div>
                    )}

                    {/* Review Answers */}
                    <div>
                        <h3 className="text-xl font-black text-[#0F172A] mb-4">Xem lại đáp án</h3>
                        <div className="space-y-6">
                            {questions.map((q, idx) => {
                                const picked = q.type === 'ESSAY'
                                    ? (essayAnswers[q.id] ?? userAnswers[q.id])
                                    : userAnswers[q.id];
                                const answered = q.type === 'ESSAY'
                                    ? typeof picked === 'string' && picked.trim().length > 0
                                    : (q.type === 'CLOZE_MCQ' || q.type === 'CLOZE_TEXT')
                                        ? (Array.isArray(picked)
                                            ? picked.some((v) => String(v || '').trim().length > 0)
                                            : !!picked)
                                        : !!picked;
                                const fallbackPoint = total > 0 ? 10 / total : 0;
                                const questionPoint = sessionActions.getQuestionPoint(q, fallbackPoint);
                                const essayEval = q.type === 'ESSAY'
                                    ? (essayEvaluation?.items?.find((item: any) => item.questionId === q.id) || null)
                                    : null;
                                const isCorrect = q.type === 'ESSAY' ? false : sessionActions.isQuestionCorrect(q, picked);

                                const earnedPoint = (() => {
                                    if (!answered) return 0;

                                    if (q.type === 'ESSAY') {
                                        const score = Number(essayEval?.score);
                                        return Number.isFinite(score) ? Math.max(0, score) : 0;
                                    }

                                    if (q.type === 'CLOZE_MCQ' || q.type === 'CLOZE_TEXT') {
                                        const userArr = Array.isArray(picked) ? picked : [];
                                        const correctArr = q.parsedCorrectAnswers;
                                        if (!correctArr.length) return 0;

                                        const clean = (s: any) => String(s || '').trim().toLowerCase().normalize('NFC').replace(/[.,!?;:]+$/, '');
                                        let correctBlanks = 0;
                                        correctArr.forEach((c: string, i: number) => {
                                            if (clean(userArr[i]) === clean(c) && String(userArr[i] || '').trim() !== '') {
                                                correctBlanks++;
                                            }
                                        });

                                        return (correctBlanks / correctArr.length) * questionPoint;
                                    }

                                    return isCorrect ? questionPoint : 0;
                                })();

                                const reviewTone: 'empty' | 'correct' | 'partial' | 'incorrect' = (() => {
                                    if (!answered) return 'empty';

                                    if (q.type === 'ESSAY') {
                                        const score = Number(essayEval?.score);
                                        const maxPoints = Number(essayEval?.maxPoints);
                                        if (Number.isFinite(score) && Number.isFinite(maxPoints) && maxPoints > 0) {
                                            if (score <= 0) return 'incorrect';
                                            if (score >= maxPoints) return 'correct';
                                            return 'partial';
                                        }
                                        return 'partial';
                                    }

                                    if (q.type === 'CLOZE_MCQ' || q.type === 'CLOZE_TEXT') {
                                        if (earnedPoint <= 0) return 'incorrect';
                                        if (earnedPoint >= questionPoint) return 'correct';
                                        return 'partial';
                                    }

                                    return isCorrect ? 'correct' : 'incorrect';
                                })();

                                const scoreBadgeText = q.type === 'ESSAY'
                                    ? `${formatPt(earnedPoint)}/${formatPt(Number(essayEval?.maxPoints) || questionPoint)} điểm`
                                    : `${formatPt(earnedPoint)}/${formatPt(questionPoint)} điểm`;

                                return (
                                    <div key={q.id} className={cn(
                                        "bg-white rounded-[32px] overflow-hidden border-2 transition-all duration-300",
                                        reviewTone === 'empty'
                                            ? "border-[#E2E8F0] grayscale"
                                            : reviewTone === 'correct'
                                                ? "border-[#10B981] shadow-lg shadow-[#10B981]/5"
                                                : reviewTone === 'partial'
                                                    ? "border-[#F59E0B] shadow-lg shadow-[#F59E0B]/10"
                                                    : "border-[#EF4444] shadow-lg shadow-[#EF4444]/5"
                                    )}>
                                        <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center",
                                                    reviewTone === 'empty'
                                                        ? "bg-white border border-[#E2E8F0]"
                                                        : reviewTone === 'correct'
                                                            ? "bg-[#D1FAE5]"
                                                            : reviewTone === 'partial'
                                                                ? "bg-[#FEF3C7]"
                                                                : "bg-[#FEE2E2]"
                                                )}>
                                                    {reviewTone === 'empty' ? <Minus size={14} className="text-[#64748B]" /> :
                                                     reviewTone === 'correct' ? <Check size={14} className="text-[#059669]" strokeWidth={3} /> :
                                                     reviewTone === 'partial' ? <CheckCircle2 size={14} className="text-[#B45309]" strokeWidth={2.75} /> :
                                                     <X size={14} className="text-[#DC2626]" strokeWidth={3} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em]">CÂU {idx + 1}</span>
                                                    <span className={cn(
                                                        "text-xs font-bold",
                                                        reviewTone === 'empty'
                                                            ? "text-[#94A3B8]"
                                                            : reviewTone === 'correct'
                                                                ? "text-[#059669]"
                                                                : reviewTone === 'partial'
                                                                    ? "text-[#B45309]"
                                                                    : "text-[#B91C1C]"
                                                    )}>
                                                        {reviewTone === 'empty'
                                                            ? 'Bỏ trống'
                                                            : reviewTone === 'correct'
                                                                ? (q.type === 'ESSAY' ? 'Đạt tối đa' : 'Chính xác')
                                                                : reviewTone === 'partial'
                                                                    ? (q.type === 'ESSAY' ? 'Đạt một phần' : 'Đúng một phần')
                                                                    : (q.type === 'ESSAY' ? 'Chưa đạt' : 'Kết quả chưa đúng')}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-xs font-black text-[#6366F1] bg-[#EEF2FF] px-2.5 py-1 rounded-lg">{scoreBadgeText}</span>
                                        </div>

                                        <div className="p-6 md:p-8">
                                            {(() => {
                                                const audioData = extractAudioTag(q.content);
                                                return (
                                                    <div className="mb-6">
                                                        <MathView content={audioData.cleanText} className="text-[17px] font-extrabold text-[#1F2937] leading-relaxed mb-4" />
                                                        {audioData.audioScript && (
                                                            <AudioPlayer script={audioData.audioScript} lang={audioData.audioLang || 'en'} showScript={true} canShowScript={true} />
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            {q.type === 'MULTIPLE_CHOICE' ? (
                                                <MCQReviewDetail
                                                    content={''}
                                                    options={q.options ?? []}
                                                    correctAnswer={q.correctAnswer ?? ''}
                                                    picked={picked}
                                                />
                                            ) : (q.type === 'CLOZE_MCQ' || q.type === 'CLOZE_TEXT') ? (
                                                <ClozeReviewDetail
                                                    type={q.type}
                                                    picked={picked}
                                                    correctAnswer={q.correctAnswer}
                                                    options={q.options}
                                                    compact={true}
                                                />
                                            ) : (
                                                <EssayReviewDetail
                                                    content={''}
                                                    picked={picked}
                                                    evaluation={essayEval}
                                                />
                                            )}
                                        </div>
                                    </div>

                                );
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6">
                        <button onClick={handleBackNavigation} className="flex-1 py-4 bg-[#F5F3FF] border border-[#C4B5FD] text-[#6D28D9] font-bold rounded-[16px] transition-all hover:bg-[#EDE9FE]">
                            Quay lại
                        </button>
                        <button
                            onClick={() => { sessionActions.resetSession(); setLoading(true); window.location.href = `/exercises/${exerciseId}?action=retry`; }}
                            className="flex-1 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-[16px] transition-all shadow-[0_8px_20px_rgba(124,58,237,0.3)] active:scale-95"
                        >
                            Làm lại
                        </button>
                    </div>
                </div>

                {/* Share Result Modal */}
                <ShareResultModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    exerciseId={exerciseId}
                    submissionId={exercise.latestSubmission?.id || ''}
                    score={scoreOnTen}
                    totalQuestions={total}
                    correctCount={correctCount}
                    onShared={() => {
                        // Optionally refresh or show toast
                    }}
                />
            </main>
        );
    }

    // ── Quiz/Mixed mode (one question at a time) ─────
    if (isQuizType && !isEssayType && currentQ) {
        return (
            <main className="flex-1 flex flex-col h-full animate-in fade-in duration-500 overflow-hidden font-sans">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] px-4 py-3 shadow-sm">
                    <div className="flex items-center justify-between max-w-3xl mx-auto">
                        <button onClick={handleBackNavigation} className="p-2 hover:bg-[#F3F4F6] rounded-full text-[#6B7280]"><ArrowLeft size={22} strokeWidth={2.5} /></button>
                        <div className="text-center">
                            <p className="font-extrabold text-[#1F2937] text-[15px] line-clamp-1 max-w-[200px]">{exercise.title}</p>
                            <p className="text-xs font-bold text-[#8B5CF6]">Câu {currentIndex + 1}/{questions.length} • Đã làm {answeredCount}</p>
                        </div>
                        <div className="w-10" />
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 bg-[#EDE9FE] rounded-full overflow-hidden max-w-3xl mx-auto">
                        <div className="h-full bg-[#8B5CF6] transition-all duration-500" style={{ width: `${progressPct}%` }} />
                    </div>
                </header>

                {/* Question Area */}
                <div className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full p-4 md:p-8 pb-32">
                    <div className="bg-white rounded-[32px] p-6 md:p-10 border-2 border-[#E5E7EB] shadow-[0_12px_44px_rgba(0,0,0,0.04)] mb-8 transition-all hover:border-[#8B5CF6]/30">
                        <div className="inline-flex items-center bg-[#F5F3FF] px-4 py-2 rounded-2xl mb-6">
                            <span className="text-[11px] font-black text-[#7C3AED] uppercase tracking-[0.2em]">CÂU {currentIndex + 1}</span>
                        </div>

                        {(() => {
                            const audioData = extractAudioTag(currentQ.content);
                            const isCloze = currentQ.type === 'CLOZE_MCQ' || currentQ.type === 'CLOZE_TEXT';
                            
                            return (
                                <div className="space-y-6">
                                    {!isCloze && (
                                        <MathView content={audioData.cleanText} className="text-xl md:text-2xl font-extrabold text-[#1F2937] leading-[1.4]" />
                                    )}

                                    {audioData.audioScript && (
                                        <div className="my-6">
                                            <AudioPlayer script={audioData.audioScript} lang={audioData.audioLang || 'en'} showScript={false} canShowScript={false} />
                                        </div>
                                    )}

                                    {isCloze && (
                                        <div className="text-lg md:text-xl font-medium text-[#374151] leading-relaxed">
                                            {(() => {
                                                const parts = audioData.cleanText.split(/(\[\d+\]|___+|\.\.\.+)/g);
                                                let blankCounter = 0;
                                                return parts.map((part, index) => {
                                                    const matchTag = part.match(/\[(\d+)\]/);
                                                    const isLegacyBlank = part.includes('___') || part.includes('...');
                                                    
                                                    if (matchTag || isLegacyBlank) {
                                                        const bIdx = matchTag ? parseInt(matchTag[1]) - 1 : blankCounter++;
                                                        const bPicked = Array.isArray(userAnswers[currentQ.id]) ? userAnswers[currentQ.id][bIdx] : (currentIndex === bIdx ? userAnswers[currentQ.id] : null);
                                                        
                                                        if (currentQ.type === 'CLOZE_TEXT') {
                                                            return (
                                                                <span key={index} className="inline-flex items-baseline space-x-1 mx-1.5 translate-y-1">
                                                                    <span className="text-[12px] font-black text-[#8B5CF6] align-super opacity-60">({bIdx + 1})</span>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="..."
                                                                        className="min-w-[120px] max-w-[200px] border-b-2 border-dashed border-[#DDD6FE] outline-none text-center font-bold text-[#7C3AED] bg-transparent focus:border-solid focus:border-[#8B5CF6] transition-all placeholder:text-[#E2E8F0] px-1"
                                                                        value={bPicked || ''}
                                                                        onChange={(e) => sessionActions.handlePickClozeAnswer(currentQ.id, bIdx, e.target.value)}
                                                                    />
                                                                </span>
                                                            );
                                                        }
                                                        
                                                        return (
                                                            <span key={index} className="inline-flex items-baseline space-x-1 mx-1.5 group cursor-pointer" 
                                                                  onClick={() => {
                                                                      // Smooth scroll to the choice group if needed
                                                                      const el = document.getElementById(`cloze-options-${currentQ.id}-${bIdx}`);
                                                                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                                  }}>
                                                                <span className="text-[12px] font-black text-[#8B5CF6] align-super opacity-60">({bIdx + 1})</span>
                                                                <span className={cn(
                                                                    "min-w-[100px] px-3 border-b-2 border-dashed text-center transition-all group-hover:border-[#C084FC]",
                                                                    bPicked ? "border-[#8B5CF6] text-[#7C3AED] font-black border-solid bg-[#F5F3FF]/50 rounded-t-lg" : "border-[#DDD6FE] text-[#A78BFA] italic"
                                                                )}>
                                                                    {bPicked || '_________'}
                                                                </span>
                                                            </span>
                                                        );
                                                    }
                                                    return <span key={index}><MathView content={part} inline /></span>;
                                                });
                                            })()}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Interaction Area */}
                    <div className="space-y-4 animate-slide-up-fade">
                        {currentQ.type === 'MULTIPLE_CHOICE' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(currentQ.options ?? []).map((opt: string, oi: number) => {
                                    const isPicked = userAnswers[currentQ.id] === opt;
                                    return (
                                        <button
                                            key={oi}
                                            onClick={() => sessionActions.handlePickAnswer(currentQ.id, opt)}
                                            className={cn(
                                                "w-full flex items-center text-left p-5 rounded-[24px] border-2 transition-all duration-300 transform active:scale-[0.98]",
                                                isPicked
                                                    ? "bg-[#F5F3FF] border-[#6366F1] shadow-[0_8px_24px_rgba(99,102,241,0.15)] -translate-y-0.5"
                                                    : "bg-white border-[#E2E8F0] hover:border-[#8B5CF6]/50 hover:bg-[#FAFAFA] hover:-translate-y-0.5 hover:shadow-md"
                                            )}
                                        >
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 font-black text-sm transition-colors",
                                                isPicked ? "bg-[#6366F1] text-white" : "bg-[#F1F5F9] text-[#64748B]"
                                            )}>
                                                {OPTION_LABELS[oi]}
                                            </div>
                                            <div className="flex-1 pr-2">
                                                <MathView
                                                    content={opt}
                                                    inline
                                                    className={cn("text-[16px] leading-snug transition-colors", isPicked ? "font-bold text-[#1F2937]" : "text-[#374151]")}
                                                />
                                            </div>
                                            {isPicked && <div className="w-6 h-6 rounded-full bg-[#6366F1] flex items-center justify-center text-white animate-scale-in"><Check size={14} strokeWidth={4} /></div>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {currentQ.type === 'CLOZE_MCQ' && (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                {(currentQ.options as string[][]).map((bOpts, bIdx) => {
                                    const bPicked = Array.isArray(userAnswers[currentQ.id]) ? userAnswers[currentQ.id][bIdx] : null;
                                    return (
                                        <div key={bIdx} id={`cloze-options-${currentQ.id}-${bIdx}`} className={cn(
                                            "bg-white border-2 rounded-[32px] p-6 shadow-sm transition-all",
                                            bPicked ? "border-[#8B5CF6]/40" : "border-[#E2E8F0]"
                                        )}>
                                            <p className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] mb-4 flex items-center">
                                                <span className="w-5 h-5 rounded-lg bg-[#F1F5F9] flex items-center justify-center mr-2 text-[10px] text-[#8B5CF6]">{bIdx + 1}</span>
                                                LỰA CHỌN CHO Ô TRỐNG:
                                            </p>
                                            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
                                                {bOpts.map((opt, oi) => (
                                                    <button
                                                        key={oi}
                                                        onClick={() => sessionActions.handlePickClozeAnswer(currentQ.id, bIdx, opt)}
                                                        className={cn(
                                                            "whitespace-nowrap px-6 py-4 rounded-2xl font-bold text-sm border-2 transition-all duration-300 transform active:scale-[0.98]",
                                                            bPicked === opt
                                                                ? "bg-[#6366F1] border-[#6366F1] text-white shadow-[0_8px_24px_rgba(99,102,241,0.15)] -translate-y-0.5"
                                                                : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-white hover:border-[#8B5CF6]/40 hover:-translate-y-0.5 hover:shadow-md"
                                                        )}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {currentQ.type === 'ESSAY' && (
                            <div className="bg-white border-2 border-[#E2E8F0] rounded-[32px] p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <textarea
                                    rows={8}
                                    placeholder="Viết câu trả lời tự luận của bạn tại đây..."
                                    className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-[24px] px-6 py-5 text-[16px] text-[#1F2937] placeholder:text-[#94A3B8] font-medium outline-none focus:ring-8 focus:ring-[#8B5CF6]/5 focus:border-[#8B5CF6] focus:bg-white resize-none transition-all shadow-inner"
                                    value={essayAnswers[currentQ.id] || ''}
                                    onChange={e => sessionActions.setEssayAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                                />
                            </div>
                        )}
                    </div>
                </div>


                {/* Footer Navigation */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-4 py-4 pb-[max(env(safe-area-inset-bottom),16px)] z-20">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <button
                            onClick={sessionActions.handlePrev}
                            disabled={currentIndex === 0}
                            className="flex items-center space-x-1 px-5 py-3 rounded-[16px] font-bold text-sm border-[1.5px] border-[#8B5CF6] text-[#8B5CF6] disabled:border-[#E5E7EB] disabled:text-[#D1D5DB] transition-all"
                        >
                            <ChevronLeft size={18} />
                            <span>Trước</span>
                        </button>

                        <span className="text-sm text-[#6B7280] font-semibold">{answeredCount}/{questions.length} câu</span>

                        {currentIndex < questions.length - 1 ? (
                            <button
                                onClick={sessionActions.handleNext}
                                className="flex items-center space-x-1 px-5 py-3 rounded-[16px] font-bold text-sm bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-md shadow-[#8B5CF6]/20 transition-all active:scale-95"
                            >
                                <span>Tiếp</span>
                                <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex items-center space-x-2 px-5 py-3 rounded-[16px] font-bold text-sm bg-[#10B981] hover:bg-[#059669] text-white shadow-md shadow-[#10B981]/20 transition-all active:scale-95"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={18} /> : <span>Nộp bài</span>}
                            </button>
                        )}
                    </div>
                </div>
            </main>
        );
    }

    // ── Essay / MIXED with text inputs ─────────────
    return (
        <main className="flex-1 flex flex-col h-full animate-in fade-in duration-500 overflow-hidden font-sans">
            <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between max-w-3xl mx-auto">
                    <button onClick={handleBackNavigation} className="p-2 hover:bg-[#F3F4F6] rounded-full text-[#6B7280]"><ArrowLeft size={22} strokeWidth={2.5} /></button>
                    <div className="text-center">
                        <p className="font-extrabold text-[#1F2937] text-[15px] line-clamp-1 max-w-[200px]">{exercise.title}</p>
                        <p className="text-xs font-bold text-[#6B7280]">Tự luận • {questions.length} câu</p>
                    </div>
                    <div className="w-10" />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full p-4 md:p-8 pb-32 space-y-4">
                {exercise.description && (
                    <div className="p-4 bg-[#FFF7ED] border-l-4 border-[#F59E0B] rounded-r-2xl">
                        <p className="text-sm text-[#92400E] leading-relaxed font-medium">{exercise.description}</p>
                    </div>
                )}

                <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-4">
                    <p className="text-sm text-[#1E40AF] leading-relaxed font-medium">Hãy đọc kỹ từng câu hỏi và trình bày câu trả lời của bạn bên dưới mỗi câu. AI sẽ chấm điểm và đưa ra nhận xét sau khi bạn nộp bài.</p>
                </div>

                {questions.map((q, idx) => {
                    const audioData = extractAudioTag(q.content);
                    return (
                        <div key={q.id} className="bg-white rounded-[32px] p-6 md:p-8 border-2 border-[#E5E7EB] shadow-sm transition-all hover:border-[#8B5CF6]/30">
                            <div className="flex items-start space-x-5">
                                <div className="w-10 h-10 rounded-2xl bg-[#F5F3FF] flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-black text-[#7C3AED]">{idx + 1}</span>
                                </div>
                                <div className="flex-1">
                                    <MathView content={audioData.cleanText} className="text-[17px] text-[#1F2937] font-bold leading-relaxed mb-4" />
                                    
                                    {audioData.audioScript && (
                                        <div className="mb-6 max-w-md">
                                            <AudioPlayer script={audioData.audioScript} lang={audioData.audioLang || 'en'} showScript={false} canShowScript={false} />
                                        </div>
                                    )}

                                    <textarea
                                        rows={4}
                                        placeholder="Nhập câu trả lời của bạn vào đây... AI sẽ chấm điểm dựa trên ý tưởng của bạn."
                                        className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-[24px] px-6 py-5 text-[15px] text-[#1F2937] placeholder:text-[#94A3B8] font-medium outline-none focus:ring-8 focus:ring-[#8B5CF6]/5 focus:border-[#8B5CF6] focus:bg-white resize-none transition-all shadow-inner"
                                        value={essayAnswers[q.id] || ''}
                                        onChange={e => sessionActions.setEssayAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}

            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-4 py-4 pb-[max(env(safe-area-inset-bottom),16px)] z-20">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button onClick={handleBackNavigation} className="px-5 py-3 rounded-2xl font-bold text-sm border-2 border-[#E2E8F0] text-[#6B7280]">Hủy</button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center space-x-2 px-8 py-3.5 rounded-2xl font-bold text-sm bg-[#10B981] hover:bg-[#059669] text-white shadow-xl shadow-[#10B981]/20 transition-all active:scale-95"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={18} /> : <span>Nộp bài & Chấm điểm</span>}
                    </button>
                </div>
            </div>
        </main>
    );
}
