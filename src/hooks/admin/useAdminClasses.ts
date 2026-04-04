import { useState, useCallback, useEffect } from 'react';
import { getClasses, createClass, updateClass, reorderClasses } from '@/services/adminService';
import { ClassModel } from '@/models/Class';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export const useAdminClasses = () => {
    const [classes, setClasses] = useState<ClassModel[]>([]);
    const [originalClasses, setOriginalClasses] = useState<ClassModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<ClassModel | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // DnD & Reorder state
    const [hasChanges, setHasChanges] = useState(false);
    const [isReordering, setIsReordering] = useState(false);

    const fetchClasses = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getClasses();
            setClasses(data);
            setOriginalClasses(data);
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to fetch classes', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchClasses(); }, [fetchClasses]);

    const handleOpenModal = (cls: ClassModel | null = null) => {
        setEditingClass(cls);
        setFormData(cls ? { name: cls.name, description: cls.description || '' } : { name: '', description: '' });
        setIsModalOpen(true);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (over && active.id !== over.id) {
            setClasses((items: ClassModel[]) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                setHasChanges(true);
                return newItems;
            });
        }
    };

    const handleSaveOrder = async () => {
        setIsReordering(true);
        try {
            const orders = classes.map((item: ClassModel, index: number) => ({
                id: item.id,
                order: index
            }));
            await reorderClasses(orders);
            fetchClasses();
            alert('Đã lưu thứ tự mới thành công!');
        } catch (error) {
            alert('Không thể lưu thứ tự: ' + (error as any).message);
        } finally {
            setIsReordering(false);
        }
    };

    const handleCancelOrder = () => {
        setClasses([...originalClasses]);
        setHasChanges(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;
        
        setIsSubmitting(true);
        try {
            if (editingClass) {
                await updateClass(editingClass.id, formData.name, formData.description);
            } else {
                await createClass(formData.name, formData.description);
            }
            fetchClasses();
            setIsModalOpen(false);
        } catch (error) {
            alert('Có lỗi xảy ra: ' + (error as any).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        state: {
            classes,
            isLoading,
            isModalOpen,
            editingClass,
            formData,
            isSubmitting,
            hasChanges,
            isReordering
        },
        actions: {
            setFormData,
            setIsModalOpen,
            handleOpenModal,
            handleDragEnd,
            handleSaveOrder,
            handleCancelOrder,
            handleSubmit
        }
    };
};
