import { useState, useCallback, useEffect, useMemo } from 'react';
import { getAdminLessons, getClasses, getAdminSubjects, getAllSubjects, createLesson, updateLesson, deleteLesson } from '@/services/adminService';
import { LessonModel } from '@/models/Lesson';
import { ClassModel } from '@/models/Class';
import { Subject } from '@/models/Subject';

const LIMIT = 10;

export const useAdminLessons = () => {
    const [lessons, setLessons] = useState<LessonModel[]>([]);
    const [classes, setClasses] = useState<ClassModel[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isIdling, setIsIdling] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<LessonModel | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    
    // Form state for Modal
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subjectId: '',
        classId: '',
        status: 'DRAFT' as 'DRAFT' | 'PUBLIC',
        order: 1
    });

    const fetchData = useCallback(async (pageNum: number = 1, isLoadMore: boolean = false) => {
        if (pageNum === 1) setIsLoading(true);
        else setIsIdling(true);

        try {
            const [lessonData, classData, subjectData] = await Promise.all([
                getAdminLessons(selectedClassId, selectedSubjectId, pageNum, LIMIT),
                getClasses(),
                getAllSubjects()
            ]);

            if (isLoadMore) {
                setLessons(prev => [...prev, ...lessonData.rows]);
            } else {
                setLessons(lessonData.rows);
            }
            
            setClasses(classData);
            setSubjects(subjectData);
            setHasMore(lessons.length + lessonData.rows.length < lessonData.count);
        } catch (error) {
            console.error('Failed to fetch admin lessons data', error);
        } finally {
            setIsLoading(false);
            setIsIdling(false);
        }
    }, [selectedClassId, selectedSubjectId, lessons.length]);

    useEffect(() => { 
        setPage(1);
        fetchData(1, false); 
    }, [selectedClassId, selectedSubjectId]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchData(nextPage, true);
    };

    // Filtered subjects for the side/main filters
    const filteredSubjects = useMemo(() => {
        if (!selectedClassId) return subjects; // Show all if no class selected for filtering
        return subjects.filter(s => s.classId === selectedClassId);
    }, [subjects, selectedClassId]);

    // Subjects list for Modal (based on selected class in form)
    const modalSubjects = useMemo(() => {
        if (!formData.classId) return [];
        return subjects.filter(s => s.classId === formData.classId);
    }, [subjects, formData.classId]);

    const handleOpenModal = (lesson: LessonModel | null = null) => {
        if (lesson) {
            setEditingLesson(lesson);
            setFormData({
                title: lesson.title,
                description: lesson.description || '',
                subjectId: lesson.subjectId,
                classId: lesson.subject?.classId || '',
                status: (lesson.status as any) || 'DRAFT',
                order: lesson.order || 1
            });
        } else {
            setEditingLesson(null);
            setFormData({
                title: '',
                description: '',
                subjectId: '',
                classId: '',
                status: 'DRAFT',
                order: lessons.length + 1
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.subjectId) {
            alert('Vui lòng nhập tiêu đề và chọn môn học');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingLesson) {
                await updateLesson(editingLesson.id, formData);
            } else {
                await createLesson(formData);
            }
            setIsModalOpen(false);
            setPage(1);
            fetchData(1, false);
        } catch (error) {
            alert('Lỗi: ' + (error as any).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLesson = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
        setIsIdling(true);
        try {
            await deleteLesson(id);
            setPage(1);
            fetchData(1, false);
        } catch (error) {
            alert('Lỗi khi xóa bài học: ' + (error as any).message);
        } finally {
            setIsIdling(false);
        }
    };

    return {
        state: {
            lessons,
            classes,
            subjects: filteredSubjects,
            modalSubjects,
            isLoading,
            isIdling,
            selectedClassId,
            selectedSubjectId,
            isModalOpen,
            editingLesson,
            formData,
            isSubmitting,
            hasMore
        },
        actions: {
            setSelectedClassId: (id: string) => {
                setSelectedClassId(id);
                setSelectedSubjectId('');
            },
            setSelectedSubjectId,
            setIsModalOpen,
            setFormData,
            handleOpenModal,
            handleSubmit,
            handleDeleteLesson,
            handleLoadMore,
            fetchData: () => { setPage(1); fetchData(1, false); }
        }
    };
};
