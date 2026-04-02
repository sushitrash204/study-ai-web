import { useState, useCallback } from 'react';
import { Subject } from '../../models/Subject';

export const SUBJECT_COLORS = [
    '#FF5E5E', '#5E92FF', '#50C878', '#FFB347',
    '#9B59B6', '#F1C40F', '#E74C3C', '#1ABC9C',
    '#6C5CE7', '#FF8A65', '#4FC3F7', '#AED581',
    '#D6A2E8', '#FDA7DF', '#F97F51', '#25CCF7',
    '#EAB543', '#55E6C1', '#CAD3C8', '#F8EFBA',
    '#58B19F', '#2C3A47', '#D1D8E0', '#778ca3'
];

export const useSubjectModal = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [subjectName, setSubjectName] = useState('');
    const [selectedColor, setSelectedColor] = useState(SUBJECT_COLORS[0]);

    const openAddModal = useCallback(() => {
        setEditingSubject(null);
        setSubjectName('');
        setSelectedColor(SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)]);
        setModalVisible(true);
    }, []);

    const openEditModal = useCallback((subject: Subject) => {
        setEditingSubject(subject);
        setSubjectName(subject.name);
        setSelectedColor(subject.color);
        setModalVisible(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalVisible(false);
    }, []);

    return {
        state: {
            modalVisible,
            editingSubject,
            subjectName,
            selectedColor,
            colors: SUBJECT_COLORS
        },
        actions: {
            setSubjectName,
            setSelectedColor,
            openAddModal,
            openEditModal,
            closeModal
        }
    };
};
