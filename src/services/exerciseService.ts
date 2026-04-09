import api from './api';
import { Exercise } from '../models/Exercise';
import { Submission, SubmitAnswer } from '../models/Submission';

export const getExercisesBySubject = async (subjectId: string): Promise<Exercise[]> => {
    const response = await api.get(`/exercises/subject/${subjectId}`);
    if (Array.isArray(response.data)) {
        return response.data.map((item: any) => new Exercise(item));
    }
    return [];
};

export const createExercise = async (data: any): Promise<Exercise> => {
    const response = await api.post('/exercises', data);
    return new Exercise(response.data);
};

export const deleteExercise = async (id: string): Promise<any> => {
    const response = await api.delete(`/exercises/${id}`);
    return response.data;
};

export const getExerciseDetail = async (id: string): Promise<Exercise> => {
    const response = await api.get(`/exercises/${id}`);
    return new Exercise(response.data);
};

export const generateExerciseFromDocument = async (data: {
    documentId: string;
    exerciseType: 'QUIZ' | 'ESSAY' | 'MIXED';
    questionCount: number;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    title?: string;
}): Promise<Exercise> => {
    const response = await api.post('/exercises/generate-from-document', data);
    return new Exercise(response.data);
};

export const submitExercise = async (
    id: string,
    data: { answers: SubmitAnswer[] }
): Promise<Submission> => {
    const response = await api.post(`/exercises/${id}/submit`, data);
    return new Submission(response.data);
};
