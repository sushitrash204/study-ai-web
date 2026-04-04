import { useState, useCallback, useEffect, useMemo } from 'react';
import { getAdminSubjects, updateSubjectStatus, createSubject, updateSubject, getClasses, deleteSubject } from '@/services/adminService';
import { Subject } from '@/models/Subject';
import { ClassModel } from '@/models/Class';

export const PRESET_COLORS = [
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Orange
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#1F2937', // Dark
];

const LIMIT = 10;

export const useAdminSubjects = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<ClassModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isIdling, setIsIdling] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        color: '#8B5CF6',
        classId: '',
        status: 'DRAFT' as 'DRAFT' | 'PUBLIC'
    });

    const fetchClasses = useCallback(async () => {
        try {
            const classData = await getClasses();
            setClasses(classData);
        } catch (error) {
            console.error('Failed to fetch classes', error);
        }
    }, []);

    const fetchSubjects = useCallback(async (pageNum: number, isLoadMore: boolean = false) => {
        if (pageNum === 1) setIsLoading(true);
        else setIsIdling(true);

        try {
            const data = await getAdminSubjects(pageNum, LIMIT);
            if (isLoadMore) {
                setSubjects(prev => [...prev, ...data.rows]);
            } else {
                setSubjects(data.rows);
            }
            setHasMore(subjects.length + data.rows.length < data.count);
        } catch (error) {
            console.error('Failed to fetch subjects', error);
        } finally {
            setIsLoading(false);
            setIsIdling(false);
        }
    }, [subjects.length]);

    useEffect(() => { 
        fetchClasses();
        fetchSubjects(1); 
    }, [fetchClasses]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchSubjects(nextPage, true);
    };

    const filteredSubjects = useMemo(() => {
        return subjects.filter(s => 
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.class?.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [subjects, searchQuery]);

    const handleOpenModal = (subject: Subject | null = null) => {
        if (subject) {
            setEditingSubject(subject);
            setFormData({
                name: subject.name,
                color: subject.color,
                classId: typeof subject.classId === 'string' ? subject.classId : '',
                status: subject.status as 'DRAFT' | 'PUBLIC'
            });
        } else {
            setEditingSubject(null);
            setFormData({
                name: '',
                color: '#8B5CF6',
                classId: '',
                status: 'DRAFT'
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.classId) {
            alert('Vui lòng nhập tên môn và chọn khối lớp!');
            return;
        }

        try {
            if (editingSubject) {
                await updateSubject(editingSubject.id, formData);
            } else {
                await createSubject(formData);
            }
            setIsModalOpen(false);
            setPage(1);
            fetchSubjects(1);
        } catch (error) {
            alert('Lỗi lưu môn học: ' + (error as any).message);
        }
    };

    const handleDeleteSubject = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa môn học này? Hành động này không thể hoàn tác!')) return;
        
        try {
            await deleteSubject(id);
            setPage(1);
            fetchSubjects(1);
        } catch (error) {
            alert('Lỗi khi xóa môn học: ' + (error as any).message);
        }
    };

    return {
        state: {
            subjects: filteredSubjects,
            classes,
            isLoading,
            isIdling,
            isModalOpen,
            editingSubject,
            formData,
            searchQuery,
            hasMore
        },
        actions: {
            setIsModalOpen,
            setFormData,
            handleOpenModal,
            handleSaveSubject,
            handleDeleteSubject,
            setSearchQuery,
            handleLoadMore,
            fetchSubjects: () => { setPage(1); fetchSubjects(1); }
        }
    };
};
