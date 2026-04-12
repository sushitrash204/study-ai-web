import { EssayEvaluationResult, SubmitAnswer, SubmissionAnswerData, SubmissionData } from '../types';

export class SubmissionAnswer {
    id: string;
    questionId: string | null;
    answerContent: string | null;
    isCorrect: boolean | null;
    score: number | null;

    constructor(data: SubmissionAnswerData) {
        this.id = data?.id || '';
        this.questionId = data?.questionId || null;
        this.answerContent = data?.answerContent || null;
        this.isCorrect = data?.isCorrect ?? null;
        const numericScore = Number(data?.score);
        this.score = Number.isFinite(numericScore) ? numericScore : null;
    }

    get parsedContent(): unknown {
        if (!this.answerContent) return null;
        try {
            const parsed = JSON.parse(this.answerContent);
            return Array.isArray(parsed) ? parsed : this.answerContent;
        } catch {
            return this.answerContent;
        }
    }
}

export class Submission {
    id: string;
    userId: string | null;
    score: number | null;
    status: 'SUBMITTED' | 'GRADED';
    submittedAt: string;
    correctCount: number;
    wrongCount: number;
    totalCount: number;
    answers: SubmissionAnswer[];
    essayEvaluation?: EssayEvaluationResult | null;

    constructor(data: SubmissionData) {
        this.id = data?.id || '';
        this.userId = data?.userId ?? null;
        this.score = data?.score ?? null;
        this.status = data?.status || 'SUBMITTED';
        this.submittedAt = data?.submittedAt || '';
        this.correctCount = data?.correctCount || 0;
        this.wrongCount = data?.wrongCount || 0;
        this.totalCount = data?.totalCount || 0;
        this.essayEvaluation = data?.essayEvaluation ?? null;
        this.answers = Array.isArray(data?.answers)
            ? data.answers.map((a) => new SubmissionAnswer(a))
            : [];
    }

    getAnswerFor(questionId: string): unknown {
        const ans = this.answers.find(a => a.questionId === questionId);
        return ans ? ans.parsedContent : null;
    }


    getFormattedDate(): string {
        if (!this.submittedAt) return 'N/A';
        const date = new Date(this.submittedAt);
        return date.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    get isGraded(): boolean {
        return this.status === 'GRADED';
    }
}
