import api from './api';
import { ClassModel } from '../models/Class';
import { LessonModel } from '../models/Lesson';
import { User } from '../models/User';
import { Subject } from '../models/Subject';
import type { LessonBlock, AdminStats, AdminManualExercisePayload } from '../models/adminApi';

// --- Dashboard Stats ---
export const getAdminStats = async (): Promise<AdminStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
};

// --- Class Management ---
export const getClasses = async (): Promise<ClassModel[]> => {
    const response = await api.get('/admin/classes');
    if (Array.isArray(response.data)) {
        return response.data.map(item => new ClassModel(item));
    }
    return [];
};

export const reorderClasses = async (orders: { id: string, order: number }[]): Promise<any> => {
    const response = await api.put('/admin/classes/reorder', { orders });
    return response.data;
};

export const createClass = async (name: string, description?: string): Promise<ClassModel> => {
    const response = await api.post('/admin/classes', { name, description });
    return new ClassModel(response.data);
};

export const updateClass = async (id: string, name: string, description?: string): Promise<ClassModel> => {
    const response = await api.put(`/admin/classes/${id}`, { name, description });
    return new ClassModel(response.data);
};

// --- Subject Management (System) ---
export const getAdminSubjects = async (page: number = 1, limit: number = 10): Promise<{ count: number, rows: Subject[] }> => {
    const response = await api.get(`/admin/subjects?page=${page}&limit=${limit}`);
    if (response.data && Array.isArray(response.data.rows)) {
        return {
            count: response.data.count,
            rows: response.data.rows.map((item: any) => new Subject(item))
        };
    }
    return { count: 0, rows: [] };
};

export const getAllSubjects = async (): Promise<Subject[]> => {
    const response = await api.get('/admin/subjects/all');
    if (Array.isArray(response.data)) {
        return response.data.map(item => new Subject(item));
    }
    return [];
};

export const updateSubjectStatus = async (id: string, status: 'DRAFT' | 'PUBLIC'): Promise<Subject> => {
    const response = await api.put(`/admin/subjects/${id}/status`, { status });
    return new Subject(response.data);
};

export const createSubject = async (data: { name: string, color: string, status?: 'DRAFT' | 'PUBLIC' }): Promise<Subject> => {
    const response = await api.post('/admin/subjects', data);
    return new Subject(response.data);
};

export const updateSubject = async (id: string, data: Partial<{ name: string, color: string, classId: string, status: 'DRAFT' | 'PUBLIC' }>): Promise<Subject> => {
    const response = await api.put(`/admin/subjects/${id}`, data);
    return new Subject(response.data);
};

export const deleteSubject = async (id: string): Promise<any> => {
    const response = await api.delete(`/admin/subjects/${id}`);
    return response.data;
};

// --- Lesson Management ---
export const getAdminLessons = async (classId?: string, subjectId?: string, page: number = 1, limit: number = 10): Promise<{ count: number, rows: LessonModel[] }> => {
    const params = new URLSearchParams();
    if (classId) params.append('classId', classId);
    if (subjectId) params.append('subjectId', subjectId);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await api.get(`/admin/lessons?${params.toString()}`);
    if (response.data && Array.isArray(response.data.rows)) {
        return {
            count: response.data.count,
            rows: response.data.rows.map((item: any) => new LessonModel(item))
        };
    }
    return { count: 0, rows: [] };
};

export const getAdminLessonById = async (id: string): Promise<LessonModel> => {
    const response = await api.get(`/admin/lessons/${id}`);
    return new LessonModel(response.data);
};

export const createLesson = async (data: { title: string, description?: string, order?: number, subjectId: string, status?: 'DRAFT' | 'PUBLIC', contentStyle?: 'BLOCKS' | 'HTML', content?: any }): Promise<LessonModel> => {
    const response = await api.post('/admin/lessons', data);
    return new LessonModel(response.data);
};

export const updateLesson = async (id: string, data: Partial<{ title: string, description: string, order: number, status: 'DRAFT' | 'PUBLIC', contentStyle: 'BLOCKS' | 'HTML', content: any }>): Promise<LessonModel> => {
    const response = await api.put(`/admin/lessons/${id}`, data);
    return new LessonModel(response.data);
};

export const createAdminManualExercise = async (payload: AdminManualExercisePayload) => {
    const response = await api.post('/admin/exercises/manual', payload);
    return response.data;
};

export const updateAdminManualExercise = async (id: string, payload: AdminManualExercisePayload) => {
    const response = await api.put(`/admin/exercises/manual/${id}`, payload);
    return response.data;
};

export const generateLessonBlocksFromPdf = async (file: File, titleHint?: string): Promise<LessonBlock[]> => {
    const formData = new FormData();
    formData.append('file', file);
    if (titleHint && titleHint.trim()) {
        formData.append('titleHint', titleHint.trim());
    }

    const response = await api.post('/admin/lessons/generate-blocks', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return Array.isArray(response.data?.blocks) ? response.data.blocks : [];
};

export const uploadLessonImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/admin/lessons/upload-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return String(response.data?.url || '');
};

export const deleteLesson = async (id: string): Promise<any> => {
    const response = await api.delete(`/admin/lessons/${id}`);
    return response.data;
};

// --- User Management ---
export const getAdminUsers = async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    if (Array.isArray(response.data)) {
        return response.data.map(item => new User(item));
    }
    return [];
};

export const updateUserRole = async (id: string, role: 'USER' | 'ADMIN'): Promise<User> => {
    const response = await api.put(`/admin/users/${id}/role`, { role });
    return new User(response.data);
};
