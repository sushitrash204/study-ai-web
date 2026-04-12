// Admin related interfaces (Extracted from models/adminApi.ts)

export interface LessonBlock {
    id: string;
    type: 'header' | 'paragraph' | 'image' | 'math' | 'bullet_list' | 'divider' | 'code';
    data: {
        text?: string;
        url?: string;
        caption?: string;
        expression?: string;
        items?: string[];
        code?: string;
        language?: string;
    };
}

export interface AdminStats {
    users: { total: number, admins: number };
    content: {
        classes: number;
        subjects: number;
        lessons: number;
        documents: number;
        exercises: number;
    }
}

export interface AdminManualExerciseQuestionInput {
    content: string;
    type: 'MULTIPLE_CHOICE' | 'ESSAY' | 'CLOZE_MCQ' | 'CLOZE_TEXT';
    options?: string[] | string[][];
    correctAnswer?: string | string[] | null;
    points?: number;
}

export interface AdminManualExercisePayload {
    lessonId: string;
    title: string;
    description?: string;
    type: 'QUIZ' | 'ESSAY' | 'MIXED';
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | null;
    publishStatus: 'DRAFT' | 'PUBLIC';
    questions: AdminManualExerciseQuestionInput[];
}
