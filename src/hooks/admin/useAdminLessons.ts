import { useState, useCallback, useEffect, useMemo } from 'react';
import { getAdminLessons, getClasses, getAllSubjects, deleteLesson } from '@/services/adminService';
import { LessonModel } from '@/models/Lesson';
import { ClassModel } from '@/models/Class';
import { Subject } from '@/models/Subject';

const LIMIT = 10;

const getErrorMessage = (error: unknown) => {
    if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
    ) {
        const response = (error as { response?: { data?: { message?: unknown } } }).response;
        const apiMessage = response?.data?.message;
        if (typeof apiMessage === 'string' && apiMessage.trim()) {
            return apiMessage;
        }
    }

    if (error instanceof Error) return error.message;
    return 'Đã xảy ra lỗi không xác định.';
};

export const useAdminLessons = () => {
    const [lessons, setLessons] = useState<LessonModel[]>([]);
    const [classes, setClasses] = useState<ClassModel[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isIdling, setIsIdling] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

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
            setHasMore((isLoadMore ? lessons.length + lessonData.rows.length : lessonData.rows.length) < lessonData.count);
        } catch (error: unknown) {
            console.error('Failed to fetch admin lessons data', error);
        } finally {
            setIsLoading(false);
            setIsIdling(false);
        }
    }, [selectedClassId, selectedSubjectId, lessons.length]);

    useEffect(() => { 
        setPage(1);
        fetchData(1, false); 
    }, [fetchData]);

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

    const handleDeleteLesson = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
        setIsIdling(true);
        try {
            await deleteLesson(id);
            setPage(1);
            fetchData(1, false);
        } catch (error: unknown) {
            alert('Lỗi khi xóa bài học: ' + getErrorMessage(error));
        } finally {
            setIsIdling(false);
        }
    };

    return {
        state: {
            lessons,
            classes,
            subjects: filteredSubjects,
            isLoading,
            isIdling,
            selectedClassId,
            selectedSubjectId,
            hasMore
        },
        actions: {
            setSelectedClassId: (id: string) => {
                setSelectedClassId(id);
                setSelectedSubjectId('');
            },
            setSelectedSubjectId,
            handleDeleteLesson,
            handleLoadMore,
            fetchData: () => { setPage(1); fetchData(1, false); }
        }
    };
};
