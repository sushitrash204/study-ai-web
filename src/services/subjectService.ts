import api from './api';
import { Subject } from '../models/Subject';

export const getSubjects = async (): Promise<Subject[]> => {
    const response = await api.get('/subjects');
    if (Array.isArray(response.data)) {
        return response.data.map(item => new Subject(item));
    }
    return [];
};

export const getClasses = async (): Promise<any[]> => {
    const response = await api.get('/subjects/classes');
    return response.data || [];
};

export const getSystemSubjects = async (classId?: string): Promise<Subject[]> => {
    const response = await api.get('/subjects/system', { params: { classId } });
    if (Array.isArray(response.data)) {
        return response.data.map(item => new Subject(item));
    }
    return [];
};

export const createSubject = async (name: string, color?: string, classId?: string): Promise<Subject> => {
    const response = await api.post('/subjects', { name, color, classId });
    return new Subject(response.data);
};

export const updateSubject = async (id: string, name: string, color?: string): Promise<Subject> => {
    const response = await api.put(`/subjects/${id}`, { name, color });
    return new Subject(response.data);
};

export const deleteSubject = async (id: string): Promise<any> => {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
};
