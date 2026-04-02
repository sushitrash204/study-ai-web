import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as documentService from '@/services/documentService';
import { useExercise } from '@/hooks/exercise/useExercise';
import { Exercise } from '@/models/Exercise';
import { Document } from '@/models/Document';

export const useSubjectDetail = (subjectId: string) => {
    const router = useRouter();
    const { state: { exercisesBySubject }, actions: exActions } = useExercise();
    
    const exercises = exercisesBySubject[subjectId] || [];
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Generate from PDF state
    const [genModalVisible, setGenModalVisible] = useState(false);
    const [pdfDocs, setPdfDocs] = useState<Document[]>([]);
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [genType, setGenType] = useState<'QUIZ' | 'ESSAY' | 'MIXED'>('QUIZ');
    const [genCount, setGenCount] = useState(10);
    const [genDifficulty, setGenDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
    const [generating, setGenerating] = useState(false);

    const fetchExercises = useCallback(async () => {
        try {
            await exActions.fetchExercisesBySubject(subjectId, true);
        } catch (error) {
            console.error('Fetch exercises error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [subjectId, exActions]);

    const openGenModal = useCallback(async () => {
        setSelectedDocId(null);
        setGenType('QUIZ');
        setGenCount(10);
        setGenDifficulty('MEDIUM');
        try {
            const docs = await documentService.getDocumentsBySubject(subjectId);
            const pdfs = docs.filter(
                (d: Document) => (d.fileType || '').toLowerCase() === 'pdf'
            );
            setPdfDocs(pdfs);
        } catch {
            setPdfDocs([]);
        }
        setGenModalVisible(true);
    }, [subjectId]);

    const handleGenerateExercise = useCallback(async () => {
        if (!selectedDocId) {
            window.alert('Vui lòng chọn một tài liệu PDF.');
            return;
        }

        setGenerating(true);
        try {
            const result = await exActions.handleGenerateExercise({
                documentId: selectedDocId,
                exerciseType: genType,
                questionCount: genCount,
                difficulty: genDifficulty,
            });
            setGenModalVisible(false);
            if (result) {
                if (window.confirm(`Tạo thành công! Bộ đề "${result.title}" đã được tạo. Bạn có muốn làm ngay không?`)) {
                    router.push(`/exercises/${result.id}`);
                }
            }
        } catch (error: any) {
            // Error handled in hook
        } finally {
            setGenerating(false);
        }
    }, [selectedDocId, genType, genCount, genDifficulty, exActions, router]);

    const openExerciseActionMenu = useCallback((item: Exercise) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa bộ đề "${item.title}"?`)) {
            exActions.handleDeleteExercise(item);
        }
    }, [exActions]);

    const openExerciseDetail = useCallback((exerciseId: string, entryAction: 'start' | 'review' | 'retry') => {
        // We can pass the action via query params if needed, or the exercise page handles it internally
        router.push(`/exercises/${exerciseId}?action=${entryAction}`);
    }, [router]);

    return {
        state: {
            exercises,
            loading,
            refreshing,
            genModalVisible,
            pdfDocs,
            selectedDocId,
            genType,
            genCount,
            genDifficulty,
            generating
        },
        actions: {
            fetchExercises,
            openGenModal,
            setGenModalVisible,
            setSelectedDocId,
            setGenType,
            setGenCount,
            setGenDifficulty,
            handleGenerateExercise,
            openExerciseActionMenu,
            openExerciseDetail,
            setRefreshing
        }
    };
};
