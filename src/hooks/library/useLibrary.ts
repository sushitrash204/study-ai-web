import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import * as documentService from '../../services/documentService';
import * as exerciseService from '../../services/exerciseService';
import { useDocument } from './useDocument';
import { useSubject } from '../subject/useSubject';
import { Document } from '../../models/Document';

export interface Section {
    id: string;
    title: string;
    color: string;
    data: Document[];
}

export const useLibrary = () => {
    const { isAuthenticated } = useAuthStore();
    const { state: { documents, isLoading: docLoading, isUploading, isRefreshing: docRefreshing }, actions: docActions } = useDocument({ autoFetch: isAuthenticated });
    const { state: { subjects, isLoading: subLoading, isRefreshing: subRefreshing }, actions: subActions } = useSubject({ autoFetch: isAuthenticated });

    const [sections, setSections] = useState<Section[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

    // Document Upload & Edit States
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUploadSubjectId, setSelectedUploadSubjectId] = useState<string | null>(null);
    const [customTitle, setCustomTitle] = useState('');
    const [editingDoc, setEditingDoc] = useState<Document | null>(null);
    const [editTitleModalVisible, setEditTitleModalVisible] = useState(false);
    const [editingTitle, setEditingTitle] = useState('');
    const [savingEditedTitle, setSavingEditedTitle] = useState(false);

    // AI Generation States
    const [genModalDoc, setGenModalDoc] = useState<Document | null>(null);
    const [genType, setGenType] = useState<'QUIZ' | 'ESSAY' | 'MIXED'>('QUIZ');
    const [genCount, setGenCount] = useState(10);
    const [genDifficulty, setGenDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
    const [generating, setGenerating] = useState(false);

    // Group documents into sections by subject
    useEffect(() => {
        if (!subjects || !documents) return;
        
        const grouped: Section[] = subjects.map(sub => ({
            id: sub.id,
            title: sub.name || 'Không tên',
            color: sub.color || '#007AFF',
            data: documents.filter(doc => doc.subjectId === sub.id)
        })).filter(sec => sec.data && sec.data.length > 0);

        const orphanedDocs = documents.filter(doc => !subjects.find(s => s.id === doc.subjectId));
        if (orphanedDocs.length > 0) {
            grouped.push({
                id: 'other',
                title: 'Khác',
                color: '#8E8E93',
                data: orphanedDocs
            });
        }
        setSections(grouped);
    }, [subjects, documents]);

    const onRefresh = useCallback(() => {
        docActions.fetchDocuments(true);
        subActions.fetchSubjects(true);
    }, [docActions, subActions]);

    const handleUpload = useCallback(async (file: File) => {
        if (!selectedUploadSubjectId) {
            alert('Vui lòng chọn môn học trước khi tải tài liệu.');
            return;
        }

        try {
            setModalVisible(false);
            const normalizedTitle = customTitle.trim();

            const success = await docActions.handleUploadDocument(
                file,
                selectedUploadSubjectId,
                normalizedTitle || undefined
            );

            if (success) {
                setCustomTitle('');
                setSelectedUploadSubjectId(null);
                alert('Tải lên tài liệu thành công!');
            }
        } catch (error: any) {
            alert('Lỗi: Không thể tải tài liệu: ' + error.message);
        }
    }, [selectedUploadSubjectId, customTitle, docActions]);

    const handleGenerateExercise = useCallback(async () => {
        if (!genModalDoc) return;

        setGenerating(true);
        try {
            const result = await exerciseService.generateExerciseFromDocument({
                documentId: genModalDoc.id,
                exerciseType: genType,
                questionCount: genCount,
                difficulty: genDifficulty,
            });
            setGenModalDoc(null);
            alert(`Tạo thành công bộ đề "${result.title}" với ${result.questions?.length ?? genCount} câu hỏi.`);
        } catch (error: any) {
            alert('Lỗi: ' + (error?.response?.data?.message || error.message || 'Không thể tạo bộ đề.'));
        } finally {
            setGenerating(false);
        }
    }, [genModalDoc, genType, genCount, genDifficulty]);

    const openEditTitleModal = useCallback((doc: Document) => {
        setEditingDoc(doc);
        setEditingTitle((doc.title || '').trim());
        setEditTitleModalVisible(true);
    }, []);

    const closeEditTitleModal = useCallback((force = false) => {
        if (savingEditedTitle && !force) return;
        setEditTitleModalVisible(false);
        setEditingDoc(null);
        setEditingTitle('');
    }, [savingEditedTitle]);

    const handleSaveEditedTitle = useCallback(async () => {
        if (!editingDoc) return;
        setSavingEditedTitle(true);
        const success = await docActions.handleUpdateTitle(editingDoc, editingTitle);
        setSavingEditedTitle(false);
        if (success) {
            closeEditTitleModal(true);
            alert('Đã cập nhật tiêu đề tài liệu.');
        }
    }, [editingDoc, editingTitle, docActions, closeEditTitleModal]);

    const filteredSections = useMemo(() => {
        if (!selectedSubjectId) return sections;
        return sections.filter(section => section.id === selectedSubjectId);
    }, [sections, selectedSubjectId]);

    return {
        state: {
            sections,
            filteredSections,
            selectedSubjectId,
            isLoading: docLoading || subLoading || isUploading,
            isRefreshing: docRefreshing || subRefreshing,
            isUploading,
            modalVisible,
            selectedUploadSubjectId,
            customTitle,
            editingDoc,
            editTitleModalVisible,
            editingTitle,
            savingEditedTitle,
            genModalDoc,
            genType,
            genCount,
            genDifficulty,
            generating,
            subjects,
        },
        actions: {
            setSelectedSubjectId,
            onRefresh,
            setModalVisible,
            setSelectedUploadSubjectId,
            setCustomTitle,
            handleUpload,
            handleGenerateExercise,
            openEditTitleModal,
            closeEditTitleModal,
            handleSaveEditedTitle,
            setGenModalDoc,
            setGenType,
            setGenCount,
            setGenDifficulty,
            setEditingTitle,
        }
    };
};
