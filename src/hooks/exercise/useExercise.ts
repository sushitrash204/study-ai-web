import { useState, useCallback, useMemo } from 'react';
import * as exerciseService from '../../services/exerciseService';
import { useExerciseStore } from '../../store/exerciseStore';
import { Exercise } from '../../models/Exercise';
import { Submission, SubmitAnswer } from '../../models/Submission';

export const useExercise = () => {
    const { 
        exercisesBySubject, 
        currentExerciseDetail, 
        isLoading: isStoreLoading, 
        setLoading: setStoreLoading,
        setExercises,
        setCurrentExerciseDetail,
        addExercise,
        deleteExercise: deleteExerciseFromStore
    } = useExerciseStore();

    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchExercisesBySubject = useCallback(async (subjectId: string, silent = false) => {
        if (!subjectId) return;
        if (!silent) setStoreLoading(true);
        try {
            const data = await exerciseService.getExercisesBySubject(subjectId);
            setExercises(subjectId, data);
        } catch (error: any) {
            console.error('Fetch exercises error:', error);
        } finally {
            if (!silent) setStoreLoading(false);
        }
    }, [setStoreLoading, setExercises]);

    const fetchExerciseDetail = useCallback(async (exerciseId: string) => {
        setIsLoading(true);
        try {
            const data = await exerciseService.getExerciseDetail(exerciseId);
            setCurrentExerciseDetail(data);
            return data;
        } catch (error: any) {
             alert('Lỗi: ' + (error?.response?.data?.message || 'Không thể tải chi tiết bài tập'));
             return null;
        } finally {
            setIsLoading(false);
        }
    }, [setCurrentExerciseDetail]);

    const handleGenerateExercise = useCallback(async (data: {
        documentId: string;
        exerciseType: 'QUIZ' | 'ESSAY' | 'MIXED';
        questionCount: number;
        difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
        title?: string;
    }) => {
        setIsGenerating(true);
        try {
            const result = await exerciseService.generateExerciseFromDocument(data);
            if (result.subjectId) {
                addExercise(result.subjectId, result);
            }
            return result;
        } catch (error: any) {
            alert('Lỗi: ' + (error?.response?.data?.message || error.message || 'Không thể tạo bộ đề.'));
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, [addExercise]);

    const handleDeleteExercise = useCallback(async (exercise: Exercise) => {
        const confirmed = window.confirm(`Bạn có chắc muốn xóa bài tập "${exercise.title}"?`);
        if (!confirmed) return false;

        try {
            setIsLoading(true);
            await exerciseService.deleteExercise(exercise.id);
            deleteExerciseFromStore(exercise.subjectId, exercise.id);
            alert('Đã xóa bài tập thành công.');
            return true;
        } catch (error: any) {
            alert('Lỗi: ' + (error.message || 'Không thể xóa bài tập'));
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [deleteExerciseFromStore]);

    const handleSubmitExercise = useCallback(async (exerciseId: string, answers: SubmitAnswer[]): Promise<Submission | null> => {
        setIsSubmitting(true);
        try {
            const result = await exerciseService.submitExercise(exerciseId, { answers });
            
            // Re-fetch exercise detail to update store state dynamically
            await fetchExerciseDetail(exerciseId);

            return result;
        } catch (error: any) {
             alert('Lỗi nộp bài: ' + (error?.response?.data?.message || 'Đã xảy ra lỗi khi nộp bài'));
             return null;
        } finally {
            setIsSubmitting(false);
        }
    }, [fetchExerciseDetail]);

    const clearCurrentDetail = useCallback(() => {
        setCurrentExerciseDetail(null);
    }, [setCurrentExerciseDetail]);

    const state = useMemo(() => ({ 
        exercisesBySubject, 
        currentDetail: currentExerciseDetail,
        isStoreLoading,
        isLoading, 
        isGenerating,
        isSubmitting
    }), [exercisesBySubject, currentExerciseDetail, isStoreLoading, isLoading, isGenerating, isSubmitting]);

    const actions = useMemo(() => ({ 
        fetchExercisesBySubject, 
        fetchExerciseDetail,
        handleGenerateExercise,
        handleDeleteExercise,
        handleSubmitExercise,
        clearCurrentDetail
    }), [fetchExercisesBySubject, fetchExerciseDetail, handleGenerateExercise, handleDeleteExercise, handleSubmitExercise, clearCurrentDetail]);

    return { state, actions };
};
