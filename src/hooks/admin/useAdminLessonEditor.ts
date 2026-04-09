import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import { ClassModel } from '@/models/Class';
import { Subject } from '@/models/Subject';
import { Document } from '@/models/Document';
import { Exercise } from '@/models/Exercise';
import {
  getClasses,
  getAllSubjects,
  getAdminLessonById,
  createLesson,
  updateLesson,
  generateLessonBlocksFromPdf,
  uploadLessonImage,
  createAdminManualExercise,
} from '@/services/adminService';
import type { AdminManualExercisePayload, LessonBlock } from '@/models/adminApi';
import { getDocumentsBySubject, uploadDocument, deleteDocument } from '@/services/documentService';
import { getExercisesBySubject, deleteExercise } from '@/services/exerciseService';

export type LessonForm = {
  title: string;
  description: string;
  classId: string;
  subjectId: string;
  order: number;
  status: 'DRAFT' | 'PUBLIC';
  contentStyle: 'BLOCKS' | 'HTML';
  content: LessonBlock[];
};

const createBlock = (type: LessonBlock['type']): LessonBlock => ({
  id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type,
  data:
    type === 'header'
      ? { text: 'Tiêu đề mới' }
      : type === 'paragraph'
        ? { text: 'Nội dung đoạn văn...' }
        : type === 'math'
          ? { expression: 'a^2 + b^2 = c^2' }
          : type === 'quote'
            ? { text: 'Một trích dẫn truyền cảm hứng...', author: 'Tác giả' }
            : type === 'bullet_list'
              ? { items: ['Ý chính 1', 'Ý chính 2', 'Ý chính 3'] }
              : type === 'callout'
                ? { text: 'Ghi chú quan trọng', tone: 'info' }
                : type === 'divider'
                  ? {}
                  : { url: '', caption: '' },
});

const isBlockType = (value: string): value is LessonBlock['type'] => {
  return value === 'header'
    || value === 'paragraph'
    || value === 'math'
    || value === 'image'
    || value === 'quote'
    || value === 'bullet_list'
    || value === 'callout'
    || value === 'divider';
};

export const useAdminLessonEditor = ({ id, isCreateMode }: { id: string; isCreateMode: boolean }) => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [imageUploadingId, setImageUploadingId] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [referencesLoading, setReferencesLoading] = useState(false);
  const [uploadingReference, setUploadingReference] = useState(false);
  const [creatingPractice, setCreatingPractice] = useState(false);
  const [referenceDocuments, setReferenceDocuments] = useState<Document[]>([]);
  const [practiceExercises, setPracticeExercises] = useState<Exercise[]>([]);

  const [form, setForm] = useState<LessonForm>({
    title: '',
    description: '',
    classId: '',
    subjectId: '',
    order: 1,
    status: 'DRAFT',
    contentStyle: 'BLOCKS',
    content: [createBlock('header'), createBlock('paragraph')],
  });

  useEffect(() => {
    Promise.all([getClasses(), getAllSubjects()])
      .then(async ([classData, subjectData]) => {
        setClasses(classData);
        setSubjects(subjectData);

        if (!isCreateMode) {
          const lesson = await getAdminLessonById(id);
          setForm({
            title: lesson.title,
            description: lesson.description || '',
            classId: lesson.subject?.classId || '',
            subjectId: lesson.subjectId,
            order: lesson.order || 1,
            status: lesson.status,
            contentStyle: lesson.contentStyle || 'BLOCKS',
            content: Array.isArray(lesson.content) && lesson.content.length
              ? lesson.content
              : [createBlock('header'), createBlock('paragraph')],
          });
        }
      })
      .catch(() => {
        window.alert('Không thể tải dữ liệu editor bài học.');
      })
      .finally(() => setLoading(false));
  }, [id, isCreateMode]);

  const modalSubjects = useMemo(() => {
    if (!form.classId) return [];
    return subjects.filter((s) => s.classId === form.classId);
  }, [subjects, form.classId]);

  const refreshRelatedContent = async (subjectIdParam?: string) => {
    const subjectId = subjectIdParam || form.subjectId;
    if (isCreateMode || !subjectId) {
      setReferenceDocuments([]);
      setPracticeExercises([]);
      return;
    }

    setReferencesLoading(true);
    try {
      const [documents, exercises] = await Promise.all([
        getDocumentsBySubject(subjectId),
        getExercisesBySubject(subjectId),
      ]);

      setReferenceDocuments(documents.filter((doc) => doc.lessonId === id));
      setPracticeExercises(exercises.filter((exercise) => exercise.lessonId === id));
    } catch {
      setReferenceDocuments([]);
      setPracticeExercises([]);
    } finally {
      setReferencesLoading(false);
    }
  };

  useEffect(() => {
    void refreshRelatedContent();
  }, [id, isCreateMode, form.subjectId]);

  const updateBlock = (blockId: string, data: LessonBlock['data']) => {
    setForm((prev) => ({
      ...prev,
      content: prev.content.map((b) => (b.id === blockId ? { ...b, data } : b)),
    }));
  };

  const removeBlock = (blockId: string) => {
    setForm((prev) => ({ ...prev, content: prev.content.filter((b) => b.id !== blockId) }));
  };

  const addBlock = (type: LessonBlock['type'], placement: 'top' | 'bottom' = 'top') => {
    setForm((prev) => {
      const nextBlock = createBlock(type);
      return {
        ...prev,
        content: placement === 'top' ? [nextBlock, ...prev.content] : [...prev.content, nextBlock],
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeId = String(active.id);
    const overId = over ? String(over.id) : '';

    if (activeId.startsWith('palette:')) {
      if (!overId) return;
      const type = activeId.replace('palette:', '');

      if (!isBlockType(type)) {
        return;
      }

      setForm((prev) => {
        const nextBlock = createBlock(type);
        const overIndex = prev.content.findIndex((item) => item.id === overId);

        if (overId === 'editor-dropzone' || overIndex === -1) {
          return { ...prev, content: [...prev.content, nextBlock] };
        }

        const nextContent = [...prev.content];
        nextContent.splice(overIndex, 0, nextBlock);
        return { ...prev, content: nextContent };
      });
      return;
    }

    if (!overId || activeId === overId) return;

    setForm((prev) => {
      const oldIndex = prev.content.findIndex((item) => item.id === activeId);
      const newIndex = prev.content.findIndex((item) => item.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return { ...prev, content: arrayMove(prev.content, oldIndex, newIndex) };
    });
  };

  const uploadImageToSupabase = async (blockId: string, file: File) => {
    setImageUploadingId(blockId);
    try {
      const imageUrl = await uploadLessonImage(file);
      if (!imageUrl) {
        throw new Error('Không nhận được URL ảnh từ server.');
      }

      updateBlock(blockId, {
        ...form.content.find((b) => b.id === blockId)?.data,
        url: imageUrl,
      });
    } catch {
      window.alert('Upload ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setImageUploadingId(null);
    }
  };

  const handleGenerateFromPdf = async (file: File) => {
    setGenerating(true);
    try {
      const blocks = await generateLessonBlocksFromPdf(file, form.title);
      setForm((prev) => ({ ...prev, contentStyle: 'BLOCKS', content: blocks }));
    } catch {
      window.alert('Không thể generate từ PDF.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.subjectId) {
      window.alert('Vui lòng nhập tên bài học và chọn môn học.');
      return;
    }

    if (imageUploadingId) {
      window.alert('Ảnh đang tải lên. Vui lòng đợi hoàn tất trước khi lưu.');
      return;
    }

    const invalidImageBlock = form.content.find(
      (block) => block.type === 'image' && !String(block.data?.url || '').includes('/storage/v1/object/public/')
    );

    if (invalidImageBlock) {
      window.alert('Block ảnh phải upload lên Supabase trước khi lưu bài học.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description,
        subjectId: form.subjectId,
        order: form.order,
        status: form.status,
        contentStyle: 'BLOCKS' as const,
        content: form.content,
      };

      if (isCreateMode) {
        await createLesson(payload);
      } else {
        await updateLesson(id, payload);
      }

      router.push('/admin/lessons');
    } catch {
      window.alert('Không thể lưu bài học.');
    } finally {
      setSaving(false);
    }
  };

  const uploadReferenceDocument = async (
    file: File,
    title?: string,
    status: 'DRAFT' | 'PUBLIC' = form.status || 'DRAFT'
  ): Promise<boolean> => {
    if (isCreateMode) {
      window.alert('Vui lòng lưu bài học trước, sau đó thêm tài liệu tham khảo.');
      return false;
    }

    if (!form.subjectId) {
      window.alert('Vui lòng chọn môn học trước khi thêm tài liệu.');
      return false;
    }

    setUploadingReference(true);
    try {
      await uploadDocument(file, form.subjectId, title, id, status);
      await refreshRelatedContent(form.subjectId);
      return true;
    } catch {
      window.alert('Không thể tải tài liệu tham khảo lên lúc này.');
      return false;
    } finally {
      setUploadingReference(false);
    }
  };

  const uploadReferenceDocuments = async (
    files: FileList | File[],
    title?: string,
    status: 'DRAFT' | 'PUBLIC' = form.status || 'DRAFT'
  ): Promise<boolean> => {
    const selectedFiles = Array.isArray(files) ? files : Array.from(files || []);
    if (!selectedFiles.length) {
      return false;
    }

    if (isCreateMode) {
      window.alert('Vui lòng lưu bài học trước, sau đó thêm tài liệu tham khảo.');
      return false;
    }

    if (!form.subjectId) {
      window.alert('Vui lòng chọn môn học trước khi thêm tài liệu.');
      return false;
    }

    setUploadingReference(true);
    try {
      for (let i = 0; i < selectedFiles.length; i += 1) {
        const file = selectedFiles[i];
        const customTitle = selectedFiles.length === 1 ? title : undefined;
        await uploadDocument(file, form.subjectId, customTitle, id, status);
      }
      await refreshRelatedContent(form.subjectId);
      return true;
    } catch {
      window.alert('Không thể tải một hoặc nhiều tài liệu tham khảo.');
      return false;
    } finally {
      setUploadingReference(false);
    }
  };

  const createManualPracticeExercise = async (payload: Omit<AdminManualExercisePayload, 'lessonId'>): Promise<boolean> => {
    if (isCreateMode) {
      window.alert('Vui lòng lưu bài học trước, sau đó thêm bài luyện tập.');
      return false;
    }

    if (!form.subjectId) {
      window.alert('Vui lòng chọn môn học trước khi thêm bài luyện tập.');
      return false;
    }

    setCreatingPractice(true);
    try {
      await createAdminManualExercise({
        ...payload,
        lessonId: id,
      });
      await refreshRelatedContent(form.subjectId);
      return true;
    } catch (error: any) {
      window.alert(error?.response?.data?.message || 'Không thể tạo bài luyện tập thủ công.');
      return false;
    } finally {
      setCreatingPractice(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài luyện tập này?')) return;
    try {
      await deleteExercise(exerciseId);
      await refreshRelatedContent(form.subjectId);
    } catch {
      window.alert('Không thể xóa bài luyện tập.');
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    try {
      await deleteDocument(docId);
      await refreshRelatedContent(form.subjectId);
    } catch {
      window.alert('Không thể xóa tài liệu.');
    }
  };

  return {
    state: {
      loading,
      saving,
      generating,
      imageUploadingId,
      classes,
      form,
      modalSubjects,
      referencesLoading,
      uploadingReference,
      creatingPractice,
      referenceDocuments,
      practiceExercises,
    },
    actions: {
      setForm,
      addBlock,
      removeBlock,
      updateBlock,
      handleDragEnd,
      uploadImageToSupabase,
      handleGenerateFromPdf,
      handleSave,
      refreshRelatedContent,
      uploadReferenceDocument,
      uploadReferenceDocuments,
      createManualPracticeExercise,
      handleDeleteExercise,
      handleDeleteDocument,
    },
  };
};
