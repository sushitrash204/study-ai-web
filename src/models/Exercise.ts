import { Question } from './Question';
import { Submission } from './Submission';
export interface LatestSubmissionSummary {
    id: string;
    score: number | null;
    status: 'SUBMITTED' | 'GRADED';
    submittedAt: string;
    correctCount: number;
    wrongCount: number;
    totalCount: number;
}

export class Exercise {
    id: string;
    title: string;
    description?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
    type: 'QUIZ' | 'ESSAY' | 'MIXED';
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | null;
    dueDate?: string;
    documentId?: string | null;
    subjectId: string;
    userId: string;
    latestSubmission?: Submission;

    // Dùng cho ExerciseDetail
    // Dùng cho ExerciseDetail
    questions?: Question[];
    submissionHistory?: Submission[];

    constructor(data: any) {
        this.id = data?.id || '';
        this.title = data?.title || 'Bài tập';
        this.description = data?.description || '';
        this.status = data?.status || 'TODO';
        this.type = data?.type || 'QUIZ';
        this.difficulty = data?.difficulty || null;
        this.dueDate = data?.dueDate;
        this.documentId = data?.documentId || null;
        this.subjectId = data?.subjectId || '';
        this.userId = data?.userId || '';
        this.latestSubmission = data?.latestSubmission ? new Submission(data.latestSubmission) : undefined;
        this.questions = Array.isArray(data?.questions) 
            ? data.questions.map((q: any) => new Question(q))
            : undefined;
        this.submissionHistory = Array.isArray(data?.submissionHistory)
            ? data.submissionHistory.map((s: any) => new Submission(s))
            : undefined;
    }

    get isCompleted(): boolean {
        return this.status === 'COMPLETED';
    }

    get isQuiz(): boolean {
        return this.type === 'QUIZ';
    }

    get isEssay(): boolean {
        return this.type === 'ESSAY';
    }

    get isMixed(): boolean {
        return this.type === 'MIXED';
    }

    get formattedScore(): string | null {
        if (!this.latestSubmission || this.latestSubmission.score == null) return null;
        const score = this.latestSubmission.score;
        const normalized = score > 10 ? score / 10 : score;
        const bounded = Math.max(0, Math.min(10, normalized));
        return bounded.toLocaleString('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });
    }

    get formattedSubmissionTime(): string | null {
        if (!this.latestSubmission?.submittedAt) return null;
        const date = new Date(this.latestSubmission.submittedAt);
        if (Number.isNaN(date.getTime())) return null;
        return date.toLocaleString('vi-VN', {
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit',
        });
    }
}
