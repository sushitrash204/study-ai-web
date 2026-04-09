import api from './api';
import { Document, DeleteDocumentResponse, DocumentChatResponse } from '../models/Document';

export const getAllDocuments = async (): Promise<Document[]> => {
    const response = await api.get('/documents');
    if (Array.isArray(response.data)) {
        return response.data.map((item: any) => new Document(item));
    }
    return [];
};

export const getDocumentsBySubject = async (subjectId: string): Promise<Document[]> => {
    const response = await api.get(`/documents/subject/${subjectId}`);
    if (Array.isArray(response.data)) {
        return response.data.map((item: any) => new Document(item));
    }
    return [];
};

export const uploadDocument = async (
    file: any,
    subjectId: string,
    title?: string,
    lessonId?: string,
    status?: 'PRIVATE' | 'DRAFT' | 'PUBLIC'
): Promise<Document> => {
    const formData = new FormData();
    const normalizedTitle = typeof title === 'string' ? title.trim() : '';

    formData.append('subjectId', subjectId);
    if (normalizedTitle) formData.append('title', normalizedTitle);
    if (lessonId) formData.append('lessonId', lessonId);
    if (status) formData.append('status', status);

    formData.append('file', file);


    const response = await api.post('/documents', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return new Document(response.data);
};

export const deleteDocument = async (id: string): Promise<DeleteDocumentResponse> => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
};

export const updateDocumentTitle = async (id: string, title: string): Promise<Document> => {
    const response = await api.patch(`/documents/${id}/title`, { title });
    return new Document(response.data);
};

export const summarizeDocument = async (id: string): Promise<{
    documentId: string;
    title: string;
    summary: string;
    sourceLength: number;
}> => {
    const response = await api.post(`/documents/${id}/summarize`);
    return response.data;
};

export const chatWithDocument = async (
    id: string,
    message: string
): Promise<DocumentChatResponse> => {
    const response = await api.post(`/documents/${id}/chat`, { message });
    return response.data;
};
