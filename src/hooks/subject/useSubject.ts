import { useEffect, useState, useCallback } from 'react';
import * as subjectService from '../../services/subjectService';
import { useSubjectStore } from '../../store/subjectStore';
import { Subject } from '../../models/Subject';

export const useSubject = (options: { autoFetch?: boolean } = {}) => {
    const { autoFetch = false } = options;
    const { subjects, setSubjects, addSubject, updateSubject, deleteSubject } = useSubjectStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchSubjects = useCallback(async (isRefresh = false) => {
        isRefresh ? setIsRefreshing(true) : setIsLoading(true);
        try {
            const data = await subjectService.getSubjects();
            setSubjects(data);
        } catch (error: any) {
            console.error('Fetch subjects error:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [setSubjects]);

    useEffect(() => {
        if (autoFetch) {
            fetchSubjects();
        }
    }, [autoFetch, fetchSubjects]);

    const handleSaveSubject = async (name: string, color: string, editingSubject?: Subject | null) => {
        if (!name.trim()) {
            alert('Vui lòng nhập tên môn học');
            return false;
        }

        try {
            setIsLoading(true);
            if (editingSubject) {
                const updated = await subjectService.updateSubject(editingSubject.id, name, color);
                updateSubject(updated);
            } else {
                const created = await subjectService.createSubject(name, color);
                addSubject(created);
            }
            return true;
        } catch (error: any) {
            alert('Lỗi: ' + (error.message || 'Không thể lưu môn học'));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSubject = async (subject: Subject) => {
        const confirmed = window.confirm(
            `Xóa môn học: "${subject.name}"?\n\nTất cả các tài liệu và bài tập liên quan cũng sẽ bị xóa.`
        );
        
        if (!confirmed) return false;

        try {
            setIsLoading(true);
            await subjectService.deleteSubject(subject.id);
            deleteSubject(subject.id);
            return true;
        } catch (error: any) {
            alert('Lỗi: ' + (error.message || 'Không thể xóa môn học'));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        state: { subjects, isLoading, isRefreshing },
        actions: { fetchSubjects, handleSaveSubject, handleDeleteSubject }
    };
};
