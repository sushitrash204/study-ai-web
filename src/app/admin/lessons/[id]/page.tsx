'use client';

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  AlertCircle,
  GripVertical,
  List,
  Loader2,
  Minus,
  Plus,
  Quote,
  Trash2,
  Sparkles,
  Save,
  Type,
  AlignLeft,
  Sigma,
  Image as ImageIcon,
  Upload,
  FileText,
  Dumbbell,
  BookOpen,
  Link2,
  RefreshCcw,
  Pencil,
  Code2,
  X,
} from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MathView from '@/components/common/MathView';
import { useAdminLessonEditor } from '@/hooks/admin/useAdminLessonEditor';
import type { LessonBlock } from '@/models/adminApi';

type PracticeQuestionDraft = {
  id: string;
  content: string;
  type: PracticeQuestionType;
  optionsText: string;
  correctAnswerText: string;
  hasAudio: boolean;
  audioLang: string;
  audioScript: string;
  points: number;
};

type ExerciseDraftType = 'QUIZ' | 'ESSAY' | 'MIXED';
type PracticeQuestionType = 'MULTIPLE_CHOICE' | 'ESSAY' | 'CLOZE_MCQ' | 'CLOZE_TEXT';

const getAllowedQuestionTypesByExerciseType = (exerciseType: ExerciseDraftType): PracticeQuestionType[] => {
  if (exerciseType === 'QUIZ') return ['MULTIPLE_CHOICE'];
  if (exerciseType === 'ESSAY') return ['ESSAY'];
  return ['MULTIPLE_CHOICE', 'ESSAY', 'CLOZE_MCQ', 'CLOZE_TEXT'];
};

const getDefaultQuestionTypeByExerciseType = (exerciseType: ExerciseDraftType): PracticeQuestionType => {
  if (exerciseType === 'ESSAY') return 'ESSAY';
  return 'MULTIPLE_CHOICE';
};

const normalizeQuestionDraftForExerciseType = (
  question: PracticeQuestionDraft,
  exerciseType: ExerciseDraftType
): PracticeQuestionDraft => {
  const allowedTypes = getAllowedQuestionTypesByExerciseType(exerciseType);
  const nextType = allowedTypes.includes(question.type)
    ? question.type
    : getDefaultQuestionTypeByExerciseType(exerciseType);

  return {
    ...question,
    type: nextType,
    optionsText: getDefaultOptionsTextByType(nextType),
    correctAnswerText: nextType === 'MULTIPLE_CHOICE' ? 'Đáp án A' : '',
    hasAudio: nextType === 'ESSAY' ? false : question.hasAudio,
    audioScript: nextType === 'ESSAY' ? '' : question.audioScript,
  };
};

const createPracticeQuestionDraft = (): PracticeQuestionDraft => ({
  id: `practice-q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  content: '',
  type: 'MULTIPLE_CHOICE',
  optionsText: 'Đáp án A\nĐáp án B\nĐáp án C\nĐáp án D',
  correctAnswerText: 'Đáp án A',
  hasAudio: false,
  audioLang: 'en',
  audioScript: '',
  points: 1,
});

const createPracticeQuestionDraftForExerciseType = (exerciseType: ExerciseDraftType): PracticeQuestionDraft => {
  const defaultType = getDefaultQuestionTypeByExerciseType(exerciseType);
  return {
    ...createPracticeQuestionDraft(),
    type: defaultType,
    optionsText: getDefaultOptionsTextByType(defaultType),
    correctAnswerText: defaultType === 'MULTIPLE_CHOICE' ? 'Đáp án A' : '',
  };
};

const getDefaultOptionsTextByType = (type: PracticeQuestionDraft['type']): string => {
  if (type === 'CLOZE_MCQ') {
    return [
      'is | are | am | be',
      'beautiful | beauty | beautify | beautifully',
    ].join('\n');
  }

  if (type === 'MULTIPLE_CHOICE') {
    return 'Đáp án A\nĐáp án B\nĐáp án C\nĐáp án D';
  }

  return '';
};

const parseOptionLines = (raw: string): string[] => {
  return raw
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseClozeMcqOptionRows = (raw: string): string[][] => {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split('|').map((choice) => choice.trim()).filter(Boolean));
};

const parseClozeAnswers = (raw: string): string[] => {
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const MCQ_LABELS = ['A', 'B', 'C', 'D'];

const getClozeTagCount = (content: string): number => {
  const matches = [...String(content || '').matchAll(/\[(\d+)\]/g)]
    .map((match) => Number(match[1]))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!matches.length) {
    return 0;
  }

  return Math.max(...matches);
};

const addClozeBlankTag = (content: string): string => {
  const normalized = String(content || '');
  const nextTagIndex = getClozeTagCount(normalized) + 1;

  if (!normalized.trim()) {
    return `Điền vào chỗ trống:\n[${nextTagIndex}]`;
  }

  if (!normalized.includes('\n')) {
    return `${normalized.trim()}\n[${nextTagIndex}]`;
  }

  if (/\s$/.test(normalized)) {
    return `${normalized}[${nextTagIndex}]`;
  }

  return `${normalized} [${nextTagIndex}]`;
};

const ensureLength = (source: string[], targetLength: number): string[] => {
  return Array.from({ length: targetLength }, (_, index) => source[index] || '');
};

const getMcqOptionsForForm = (raw: string): string[] => {
  const parsed = parseOptionLines(raw);
  return Array.from({ length: 4 }, (_, index) => parsed[index] || '');
};

const getClozeMcqRowsForForm = (raw: string, blankCount: number): string[][] => {
  const parsedRows = parseClozeMcqOptionRows(raw);

  return Array.from({ length: blankCount }, (_, rowIndex) => {
    const row = Array.isArray(parsedRows[rowIndex]) ? parsedRows[rowIndex] : [];
    return Array.from({ length: 4 }, (_, optionIndex) => row[optionIndex] || '');
  });
};

const serializeClozeRows = (rows: string[][]): string => {
  return rows
    .map((row) => row.map((item) => item.trim()).filter(Boolean).join(' | '))
    .join('\n');
};

const serializeAnswers = (answers: string[]): string => {
  return answers.map((item) => item.trim()).filter(Boolean).join(', ');
};

const normalizePointValue = (value: number): number => {
  return Number(value.toFixed(4));
};

const buildContentWithAudioTag = (content: string, hasAudio: boolean, audioLang: string, audioScript: string): string => {
  const normalizedContent = String(content || '').trim();
  if (!hasAudio) {
    return normalizedContent;
  }

  const lang = String(audioLang || 'en').trim().toLowerCase();
  const script = String(audioScript || '').trim();
  if (!script) {
    return normalizedContent;
  }

  return `[AUDIO:${lang}]${script}[/AUDIO]\n${normalizedContent}`.trim();
};

const canQuestionUseAudio = (questionType: PracticeQuestionType): boolean => {
  return questionType !== 'ESSAY';
};

const AUDIO_TAG_PATTERN = /^\[AUDIO:([a-z-]{2,10})\]([\s\S]*?)\[\/AUDIO\]\n?/i;

const parseAudioFromContent = (content: string): { script: string, lang: string, remaining: string } => {
  const match = content.match(AUDIO_TAG_PATTERN);
  if (!match) {
    return { script: '', lang: 'en', remaining: content };
  }
  return {
    lang: match[1],
    script: match[2],
    remaining: content.replace(AUDIO_TAG_PATTERN, ''),
  };
};

const getPublishStatusLabel = (status?: string): string => {
  if (status === 'PUBLIC') return 'Công khai';
  if (status === 'PRIVATE') return 'Riêng tư';
  return 'Bản nháp';
};

const resolveMultipleChoiceCorrectAnswer = (rawAnswer: string, options: string[]): string => {
  const answer = rawAnswer.trim();
  if (!answer) {
    return '';
  }

  if (options.includes(answer)) {
    return answer;
  }

  const letterMap: Record<string, number> = {
    A: 0,
    B: 1,
    C: 2,
    D: 3,
  };
  const pickedIndex = letterMap[answer.toUpperCase()];
  if (pickedIndex !== undefined && options[pickedIndex]) {
    return options[pickedIndex];
  }

  return '';
};

function SortableBlock({
  block,
  onUpdate,
  onRemove,
  onUploadImage,
  imageUploadingId,
}: {
  block: LessonBlock;
  onUpdate: (id: string, data: LessonBlock['data']) => void;
  onRemove: (id: string) => void;
  onUploadImage: (id: string, file: File) => Promise<void>;
  imageUploadingId: string | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#8B5CF6]">
          <button
            type="button"
            className="p-1.5 rounded-lg bg-[#F5F3FF] text-[#8B5CF6] cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={14} />
          </button>
          <span>{block.type}</span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(block.id)}
          className="p-2 rounded-lg text-[#EF4444] hover:bg-[#FEF2F2]"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {block.type === 'header' && (
        <input
          value={block.data.text || ''}
          onChange={(e) => onUpdate(block.id, { ...block.data, text: e.target.value })}
          className="w-full px-4 py-3 bg-[#F9FAFA] border border-[#E5E7EB] rounded-xl font-bold"
          placeholder="Nhập tiêu đề"
        />
      )}

      {block.type === 'paragraph' && (
        <textarea
          value={block.data.text || ''}
          onChange={(e) => onUpdate(block.id, { ...block.data, text: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 bg-[#F9FAFA] border border-[#E5E7EB] rounded-xl font-medium"
          placeholder="Nhập nội dung đoạn văn"
        />
      )}

      {block.type === 'math' && (
        <>
          <input
            value={block.data.expression || ''}
            onChange={(e) => onUpdate(block.id, { ...block.data, expression: e.target.value })}
            className="w-full px-4 py-3 bg-[#F9FAFA] border border-[#E5E7EB] rounded-xl font-medium"
            placeholder="Nhập biểu thức KaTeX, ví dụ: \\frac{a}{b}"
          />
          <div className="px-3 py-2 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl">
            <MathView content={`$$${block.data.expression || ''}$$`} />
          </div>
        </>
      )}

      {block.type === 'image' && (
        <div className="space-y-2">
          <input
            value={block.data.caption || ''}
            onChange={(e) => onUpdate(block.id, { ...block.data, caption: e.target.value })}
            className="w-full px-4 py-3 bg-[#F9FAFA] border border-[#E5E7EB] rounded-xl font-medium"
            placeholder="Caption ảnh"
          />
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#EEF2FF] text-[#4F46E5] text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-[#E0E7FF]">
            {imageUploadingId === block.id ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {imageUploadingId === block.id ? 'Đang tải...' : 'Upload ảnh lên Supabase'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={imageUploadingId === block.id}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void onUploadImage(block.id, file);
                }
                e.currentTarget.value = '';
              }}
            />
          </label>
          <p className="text-[11px] text-[#6B7280] font-bold uppercase tracking-widest">Ảnh bắt buộc upload lên Supabase trước khi lưu bài học.</p>
          {block.data.url && (
            <Image
              src={block.data.url}
              alt={block.data.caption || 'preview'}
              width={1200}
              height={800}
              unoptimized
              className="w-full h-auto rounded-xl border border-[#E5E7EB]"
            />
          )}
        </div>
      )}

      {block.type === 'code' && (
        <div className="space-y-2">
          <select
            value={block.data.language || 'javascript'}
            onChange={(e) => onUpdate(block.id, { ...block.data, language: e.target.value })}
            className="w-full px-4 py-3 bg-[#F9FAFA] border border-[#E5E7EB] rounded-xl font-bold"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
          </select>
          <textarea
            rows={6}
            value={block.data.code || ''}
            onChange={(e) => onUpdate(block.id, { ...block.data, code: e.target.value })}
            className="w-full px-4 py-3 bg-[#1E1E1E] text-[#D4D4D4] border border-[#333333] rounded-xl font-mono text-sm"
            placeholder="// Nhập mã nguồn tại đây..."
          />
        </div>
      )}

      {block.type === 'divider' && (
        <div className="px-3 py-4 rounded-xl bg-[#F9FAFA] border border-[#E5E7EB]">
          <div className="h-px bg-[#D1D5DB]" />
        </div>
      )}
    </div>
  );
}

function PaletteItem({
  type,
  label,
  className,
  icon,
  onClick,
}: {
  type: LessonBlock['type'];
  label: string;
  className: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette:${type}`,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs uppercase tracking-widest cursor-grab active:cursor-grabbing ${className}`}
      {...listeners}
      {...attributes}
    >
      {icon} {label}
    </button>
  );
}

export default function AdminLessonEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isCreateMode = id === 'new';
  const { state, actions } = useAdminLessonEditor({ id, isCreateMode });

  const {
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
  } = state;

  const {
    setForm,
    addBlock,
    removeBlock,
    updateBlock,
    handleDragEnd,
    uploadImageToSupabase,
    handleGenerateFromPdf,
    handleSave,
    refreshRelatedContent,
    uploadReferenceDocuments,
    createManualPracticeExercise,
    updateManualPracticeExercise,
    handleDeleteExercise,
    handleDeleteDocument,
  } = actions;

  const [activeTab, setActiveTab] = useState<'CONTENT' | 'REFERENCES' | 'PRACTICE'>('CONTENT');
  const [referenceTitle, setReferenceTitle] = useState('');
  const [referenceStatus, setReferenceStatus] = useState<'DRAFT' | 'PUBLIC'>(form.status || 'DRAFT');
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false);
  const [selectedReferenceFiles, setSelectedReferenceFiles] = useState<File[]>([]);
  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [practiceTitle, setPracticeTitle] = useState('');
  const [practiceDescription, setPracticeDescription] = useState('');
  const [practiceType, setPracticeType] = useState<ExerciseDraftType>('QUIZ');
  const [practiceDifficulty, setPracticeDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | null>('MEDIUM');
  const [practicePublishStatus, setPracticePublishStatus] = useState<'DRAFT' | 'PUBLIC'>(form.status || 'DRAFT');
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestionDraft[]>([createPracticeQuestionDraft()]);

  const practiceTotalPoints = normalizePointValue(
    practiceQuestions.reduce((sum, item) => sum + (Number.isFinite(item.points) ? item.points : 0), 0)
  );
  const isPracticePointTotalValid = Math.abs(practiceTotalPoints - 10) <= 0.0001;

  const selectedClassName = classes.find((item) => item.id === form.classId)?.name || 'Chưa chọn khối lớp';
  const selectedSubjectName = modalSubjects.find((item) => item.id === form.subjectId)?.name || 'Chưa chọn môn học';

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const { setNodeRef: setDropZoneRef, isOver } = useDroppable({ id: 'editor-dropzone' });

  if (loading) {
    return <div className="p-10">Đang tải editor bài học...</div>;
  }

  return (
    <div className="w-full min-h-[calc(100vh-120px)] p-4 md:p-6 flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <button onClick={() => router.push('/admin/lessons')} className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1F2937] font-bold">
          <ArrowLeft size={18} /> Quay lại danh sách bài học
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !!imageUploadingId}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#8B5CF6] text-white font-black hover:bg-[#7C3AED] disabled:opacity-50"
        >
          <Save size={18} /> {saving ? 'Đang lưu...' : 'Lưu bài học'}
        </button>
      </div>

      <div className="grid flex-1 min-h-0 grid-cols-1 xl:grid-cols-[360px,minmax(0,1fr)] gap-4">
        <aside className="bg-white border border-[#E5E7EB] rounded-3xl p-5 space-y-4 h-full min-h-0 overflow-y-auto">
          <h2 className="text-lg font-black text-[#1F2937]">Cấu hình bài học</h2>

          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Tên bài học"
            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] font-bold"
          />

          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Mô tả ngắn"
            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] font-medium"
          />

          <select
            value={form.classId}
            onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value, subjectId: '' }))}
            disabled={!isCreateMode}
            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] font-bold disabled:bg-[#F3F4F6] disabled:text-[#6B7280] disabled:cursor-not-allowed"
          >
            <option value="">Chọn khối lớp</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select
            value={form.subjectId}
            onChange={(e) => setForm((p) => ({ ...p, subjectId: e.target.value }))}
            disabled={!isCreateMode}
            className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] font-bold disabled:bg-[#F3F4F6] disabled:text-[#6B7280] disabled:cursor-not-allowed"
          >
            <option value="">Chọn môn học</option>
            {modalSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value || 1) }))}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] font-bold"
              placeholder="Order"
            />
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as 'DRAFT' | 'PUBLIC' }))}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] font-bold"
            >
              <option value="DRAFT">Bản nháp</option>
              <option value="PUBLIC">Công khai</option>
            </select>
          </div>

          <div className="pt-2 border-t border-[#E5E7EB] space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-[#6B7280]">Nhập liệu thông minh</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EEF2FF] text-[#4F46E5] text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-[#E0E7FF]">
              <Sparkles size={14} /> {generating ? 'Đang phân tích...' : 'Tự động nhập từ PDF'}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleGenerateFromPdf(file);
                  e.currentTarget.value = '';
                }}
              />
            </label>
          </div>
        </aside>

        <section className="space-y-4 min-h-0 flex flex-col">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-2 flex gap-2 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('CONTENT')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest ${activeTab === 'CONTENT' ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'text-[#6B7280] hover:bg-[#F9FAFA]'}`}
            >
              <BookOpen size={14} /> Nội dung
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('REFERENCES')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest ${activeTab === 'REFERENCES' ? 'bg-[#ECFDF5] text-[#059669]' : 'text-[#6B7280] hover:bg-[#F9FAFA]'}`}
            >
              <FileText size={14} /> Tài liệu tham khảo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PRACTICE')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest ${activeTab === 'PRACTICE' ? 'bg-[#FFFBEB] text-[#B45309]' : 'text-[#6B7280] hover:bg-[#F9FAFA]'}`}
            >
              <Dumbbell size={14} /> Bài luyện tập
            </button>
          </div>

          {activeTab === 'CONTENT' && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-4 flex flex-wrap gap-2">
                <PaletteItem type="header" label="Header" onClick={() => addBlock('header', 'top')} className="bg-[#F5F3FF] text-[#7C3AED]" icon={<Type size={14} />} />
                <PaletteItem type="paragraph" label="Paragraph" onClick={() => addBlock('paragraph', 'top')} className="bg-[#ECFDF5] text-[#059669]" icon={<AlignLeft size={14} />} />
                <PaletteItem type="math" label="Math" onClick={() => addBlock('math', 'top')} className="bg-[#FFFBEB] text-[#D97706]" icon={<Sigma size={14} />} />
                <PaletteItem type="image" label="Image" onClick={() => addBlock('image', 'top')} className="bg-[#EFF6FF] text-[#2563EB]" icon={<ImageIcon size={14} />} />
                <PaletteItem type="code" label="Code" onClick={() => addBlock('code', 'top')} className="bg-[#F8FAFC] text-[#475569]" icon={<Code2 size={14} />} />
                <PaletteItem type="bullet_list" label="List" onClick={() => addBlock('bullet_list', 'top')} className="bg-[#ECFEFF] text-[#0E7490]" icon={<List size={14} />} />
                <PaletteItem type="divider" label="Divider" onClick={() => addBlock('divider', 'top')} className="bg-[#F3F4F6] text-[#4B5563]" icon={<Minus size={14} />} />
                <button type="button" onClick={() => addBlock('paragraph', 'top')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F3F4F6] text-[#374151] font-black text-xs uppercase tracking-widest"><Plus size={14} /> Thêm block</button>
              </div>

              <div
                ref={setDropZoneRef}
                className={`flex-1 min-h-0 overflow-y-auto pr-1 rounded-2xl transition-colors ${isOver ? 'bg-[#F5F3FF]/40' : ''}`}
              >
                <SortableContext items={form.content.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {form.content.map((block) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        onUpdate={updateBlock}
                        onRemove={removeBlock}
                        onUploadImage={uploadImageToSupabase}
                        imageUploadingId={imageUploadingId}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            </DndContext>
          )}

          {activeTab === 'REFERENCES' && (
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 space-y-4 flex-1 min-h-0 overflow-y-auto">
              {isCreateMode ? (
                <p className="text-sm text-[#6B7280] font-medium">Lưu bài học để bắt đầu quản lý hồ sơ tài liệu.</p>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row gap-3 md:items-center">
                    <button
                      type="button"
                      disabled={uploadingReference}
                      onClick={() => {
                        setReferenceTitle('');
                        setReferenceStatus(form.status || 'DRAFT');
                        setSelectedReferenceFiles([]);
                        setIsReferenceModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#EEF2FF] text-[#4F46E5] text-xs font-black uppercase tracking-widest hover:bg-[#E0E7FF] disabled:opacity-60"
                    >
                      <Upload size={14} /> {uploadingReference ? 'Đang tải...' : 'Thêm tài liệu'}
                    </button>
                    <button
                      type="button"
                      onClick={() => refreshRelatedContent()}
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#E5E7EB] text-[#4B5563] text-xs font-black uppercase tracking-widest hover:bg-[#F9FAFA]"
                    >
                      <RefreshCcw size={14} /> Làm mới
                    </button>
                  </div>

                  {referencesLoading ? (
                    <p className="text-sm text-[#6B7280] font-medium">Đang tải tài liệu tham khảo...</p>
                  ) : referenceDocuments.length > 0 ? (
                    <div className="space-y-2">
                      {referenceDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#E5E7EB] hover:border-[#C7D2FE] hover:bg-[#FAFAFF] group/doc"
                        >
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1"
                          >
                            <p className="text-sm font-bold text-[#1F2937]">{doc.title}</p>
                            <p className="text-xs text-[#6B7280] font-medium">{doc.displayFileType} • {doc.getFormattedDate()}</p>
                          </a>
                          <div className="flex items-center gap-1 opacity-100 xl:opacity-0 group-hover/doc:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                              title="Xóa tài liệu"
                            >
                              <Trash2 size={14} />
                            </button>
                            <Link2 size={14} className="text-[#6B7280] mr-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#6B7280] font-medium">Chưa có tài liệu tham khảo nào gắn với bài học này.</p>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'PRACTICE' && (
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 space-y-4 flex-1 min-h-0 overflow-y-auto">
              {isCreateMode ? (
                <p className="text-sm text-[#6B7280] font-medium">Lưu bài học trước để quản lý bài luyện tập theo lesson.</p>
              ) : referencesLoading ? (
                <p className="text-sm text-[#6B7280] font-medium">Đang tải bài luyện tập...</p>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row gap-3 md:items-center">
                    <button
                      type="button"
                      disabled={creatingPractice}
                      onClick={() => {
                        setEditingExerciseId(null);
                        setPracticeTitle('');
                        setPracticeDescription('');
                        setPracticeType('QUIZ');
                        setPracticeDifficulty('MEDIUM');
                        setPracticePublishStatus(form.status || 'DRAFT');
                        setPracticeQuestions([createPracticeQuestionDraftForExerciseType('QUIZ')]);
                        setIsPracticeModalOpen(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FEF3C7] text-[#B45309] text-xs font-black uppercase tracking-widest hover:bg-[#FDE68A] disabled:opacity-60"
                    >
                      <Plus size={14} /> {creatingPractice ? 'Đang tạo...' : 'Tạo bài luyện tập thủ công'}
                    </button>
                    <button
                      type="button"
                      onClick={() => refreshRelatedContent()}
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#E5E7EB] text-[#4B5563] text-xs font-black uppercase tracking-widest hover:bg-[#F9FAFA]"
                    >
                      <RefreshCcw size={14} /> Làm mới
                    </button>
                  </div>

                  {practiceExercises.length > 0 ? (
                    <div className="space-y-2">
                      {practiceExercises.map((exercise) => (
                        <div key={exercise.id} className="p-3 rounded-xl border border-[#E5E7EB] flex items-center justify-between group/ex">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-[#1F2937]">{exercise.title}</p>
                            <p className="text-xs text-[#6B7280] font-medium">
                              {exercise.type === 'QUIZ' ? 'Trắc nghiệm' : exercise.type === 'ESSAY' ? 'Tự luận' : 'Tổng hợp'} • {getPublishStatusLabel(exercise.publishStatus)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-100 xl:opacity-0 group-hover/ex:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const { getExerciseDetail } = await import('@/services/exerciseService');
                                  const detail = await getExerciseDetail(exercise.id);
                                  setEditingExerciseId(detail.id);
                                  setPracticeTitle(detail.title);
                                  setPracticeDescription(detail.description || '');
                                  setPracticeType(detail.type);
                                  setPracticeDifficulty(detail.difficulty || null);
                                  setPracticePublishStatus(detail.publishStatus === 'PRIVATE' ? 'DRAFT' : (detail.publishStatus || 'DRAFT'));
                                  
                                  const draftQuestions = (detail.questions || []).map((q: any) => {
                                    const { script, lang, remaining } = parseAudioFromContent(q.content);
                                    let optionsText = '';
                                    let correctAnswerText = '';

                                    if (q.type === 'MULTIPLE_CHOICE') {
                                      optionsText = (q.options || []).join('\n');
                                      correctAnswerText = q.correctAnswer;
                                    } else if (q.type === 'CLOZE_MCQ') {
                                      optionsText = serializeClozeRows(q.options || []);
                                      correctAnswerText = serializeAnswers(q.correctAnswer || []);
                                    } else if (q.type === 'CLOZE_TEXT') {
                                      correctAnswerText = serializeAnswers(q.correctAnswer || []);
                                    }

                                    return {
                                      id: `edit-q-${q.id}-${Math.random()}`,
                                      content: remaining,
                                      type: q.type as PracticeQuestionType,
                                      optionsText,
                                      correctAnswerText,
                                      hasAudio: !!script,
                                      audioLang: lang,
                                      audioScript: script,
                                      points: q.points || 1,
                                    };
                                  });

                                  setPracticeQuestions(draftQuestions.length ? draftQuestions : [createPracticeQuestionDraftForExerciseType(detail.type)]);
                                  setIsPracticeModalOpen(true);
                                } catch {
                                  window.alert('Không thể tải chi tiết bài bài tập để chỉnh sửa.');
                                }
                              }}
                              className="p-2 text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition-colors"
                              title="Chỉnh sửa bài tập"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExercise(exercise.id)}
                              className="p-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                              title="Xóa bài tập"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#6B7280] font-medium">Chưa có bài luyện tập nào gắn với bài học này.</p>
                  )}
                </>
              )}

              <p className="text-xs text-[#6B7280] font-medium">
                Bài luyện tập ở tab này được tạo thủ công bởi admin, không phụ thuộc AI.
              </p>
            </div>
          )}
        </section>
      </div>

      {isPracticeModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111827]/45 backdrop-blur-sm p-4 md:p-6 flex items-center justify-center">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#E5E7EB] bg-white shadow-2xl p-5 md:p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-[#1F2937]">
                  {editingExerciseId ? 'Chỉnh sửa bài luyện tập' : 'Tạo bài luyện tập thủ công'}
                </h3>
                <p className="text-sm text-[#6B7280] font-medium">Nhập theo đúng schema AI: MCQ có đúng 4 lựa chọn, CLOZE dùng [1], [2]... và đáp án theo thứ tự.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!creatingPractice) {
                    setIsPracticeModalOpen(false);
                  }
                }}
                className="inline-flex items-center justify-center p-2 rounded-xl text-[#6B7280] hover:bg-[#F3F4F6]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={practiceTitle}
                onChange={(e) => setPracticeTitle(e.target.value)}
                placeholder="Tên bài luyện tập"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] font-bold"
              />
              <select
                value={practiceType}
                onChange={(e) => {
                  const nextExerciseType = e.target.value as ExerciseDraftType;
                  setPracticeType(nextExerciseType);
                  setPracticeQuestions((prev) => prev.map((question) => normalizeQuestionDraftForExerciseType(question, nextExerciseType)));
                }}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] text-xs font-black uppercase tracking-widest"
              >
                <option value="QUIZ">Trắc nghiệm</option>
                <option value="ESSAY">Tự luận</option>
                <option value="MIXED">Tổng hợp</option>
              </select>
            </div>

            <textarea
              rows={3}
              value={practiceDescription}
              onChange={(e) => setPracticeDescription(e.target.value)}
              placeholder="Mô tả ngắn (tùy chọn)"
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] font-medium"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={practiceDifficulty || ''}
                onChange={(e) => setPracticeDifficulty((e.target.value || null) as 'EASY' | 'MEDIUM' | 'HARD' | null)}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] text-xs font-black uppercase tracking-widest"
              >
                <option value="">Không đặt độ khó</option>
                <option value="EASY">Dễ</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HARD">Khó</option>
              </select>
              <select
                value={practicePublishStatus}
                onChange={(e) => setPracticePublishStatus(e.target.value as 'DRAFT' | 'PUBLIC')}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] text-xs font-black uppercase tracking-widest"
              >
                <option value="DRAFT">Bản nháp</option>
                <option value="PUBLIC">Công khai</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-[#6B7280]">Danh sách câu hỏi</p>
                <button
                  type="button"
                  onClick={() => setPracticeQuestions((prev) => [...prev, createPracticeQuestionDraftForExerciseType(practiceType)])}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F5F3FF] text-[#7C3AED] text-xs font-black uppercase tracking-widest"
                >
                  <Plus size={14} /> Thêm câu hỏi
                </button>
              </div>

              <div className={`rounded-xl border px-3 py-2 ${isPracticePointTotalValid ? 'border-[#BBF7D0] bg-[#F0FDF4]' : 'border-[#FECACA] bg-[#FEF2F2]'}`}>
                <p className={`text-sm font-black ${isPracticePointTotalValid ? 'text-[#166534]' : 'text-[#B91C1C]'}`}>
                  Tổng điểm hiện tại: {practiceTotalPoints} / 10
                </p>
                {!isPracticePointTotalValid && (
                  <p className="text-xs font-bold text-[#B91C1C] mt-1">
                    Tổng điểm phải bằng đúng 10 mới được tạo bài luyện tập.
                  </p>
                )}
              </div>

              {practiceQuestions.map((question, index) => (
                <div key={question.id} className="p-4 rounded-2xl border border-[#E5E7EB] space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-[#8B5CF6]">Câu hỏi {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => setPracticeQuestions((prev) => prev.length > 1 ? prev.filter((item) => item.id !== question.id) : prev)}
                      className="p-2 rounded-lg text-[#EF4444] hover:bg-[#FEF2F2]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={question.content}
                    onChange={(e) => setPracticeQuestions((prev) => prev.map((item) => item.id === question.id ? { ...item, content: e.target.value } : item))}
                    placeholder={question.type === 'CLOZE_MCQ' || question.type === 'CLOZE_TEXT'
                      ? 'Dòng 1: câu lệnh (ví dụ: Fill in the blank:)\nDòng 2 trở đi: đoạn có [1], [2], ...'
                      : 'Nội dung câu hỏi'}
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] font-medium"
                  />

                  {canQuestionUseAudio(question.type) ? (
                    <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] p-3 space-y-3">
                      <label className="inline-flex items-center gap-2 text-sm font-bold text-[#374151]">
                        <input
                          type="checkbox"
                          checked={question.hasAudio}
                          onChange={(e) => setPracticeQuestions((prev) => prev.map((item) => item.id === question.id ? {
                            ...item,
                            hasAudio: e.target.checked,
                          } : item))}
                          className="h-4 w-4 rounded border-[#D1D5DB]"
                        />
                        Bật bài nghe cho câu này
                      </label>

                      {question.hasAudio && (
                        <div className="grid grid-cols-1 md:grid-cols-[160px,minmax(0,1fr)] gap-2">
                          <select
                            value={question.audioLang}
                            onChange={(e) => setPracticeQuestions((prev) => prev.map((item) => item.id === question.id ? {
                              ...item,
                              audioLang: e.target.value,
                            } : item))}
                            className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-xs font-black uppercase tracking-widest"
                          >
                            <option value="en">en</option>
                            <option value="vi">vi</option>
                            <option value="ja">ja</option>
                            <option value="zh">zh</option>
                            <option value="fr">fr</option>
                            <option value="ko">ko</option>
                            <option value="es">es</option>
                            <option value="de">de</option>
                          </select>
                          <input
                            value={question.audioScript}
                            onChange={(e) => setPracticeQuestions((prev) => prev.map((item) => item.id === question.id ? {
                              ...item,
                              audioScript: e.target.value,
                            } : item))}
                            placeholder="Nhập nội dung nghe ngắn gọn (khuyến nghị dưới 200 ký tự)"
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white font-medium"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2">
                      <p className="text-xs font-bold text-[#B45309]">Câu ESSAY không hỗ trợ phần nghe vì được AI chấm tự luận.</p>
                    </div>
                  )}

                  {(question.type === 'CLOZE_MCQ' || question.type === 'CLOZE_TEXT') && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setPracticeQuestions((prev) => prev.map((item) => item.id === question.id ? {
                            ...item,
                            content: addClozeBlankTag(item.content),
                          } : item));
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#EEF2FF] text-[#4F46E5] text-xs font-black uppercase tracking-widest hover:bg-[#E0E7FF]"
                      >
                        <Plus size={12} /> Thêm ô trống
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-[220px,140px] gap-3">
                    <select
                      value={question.type}
                      onChange={(e) => setPracticeQuestions((prev) => prev.map((item) => item.id === question.id ? {
                        ...item,
                        type: e.target.value as PracticeQuestionType,
                        optionsText: getDefaultOptionsTextByType(e.target.value as PracticeQuestionType),
                        correctAnswerText: e.target.value === 'MULTIPLE_CHOICE' ? 'Đáp án A' : '',
                        hasAudio: e.target.value === 'ESSAY' ? false : item.hasAudio,
                        audioScript: e.target.value === 'ESSAY' ? '' : item.audioScript,
                      } : item))}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] text-xs font-black uppercase tracking-widest"
                    >
                      {getAllowedQuestionTypesByExerciseType(practiceType).map((typeOption) => (
                        <option key={typeOption} value={typeOption}>
                          {typeOption === 'MULTIPLE_CHOICE'
                            ? 'Trắc nghiệm'
                            : typeOption === 'ESSAY'
                              ? 'Tự luận'
                              : typeOption === 'CLOZE_MCQ'
                                ? 'Đục lỗ trắc nghiệm'
                                : 'Đục lỗ tự điền'}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={question.points}
                      onChange={(e) => setPracticeQuestions((prev) => prev.map((item) => item.id === question.id ? { ...item, points: Number(e.target.value || 1) } : item))}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] font-bold"
                      placeholder="Điểm"
                    />
                  </div>

                  {question.type !== 'ESSAY' && (
                    <>
                      {question.type === 'MULTIPLE_CHOICE' && (() => {
                        const mcqOptions = getMcqOptionsForForm(question.optionsText);
                        const currentAnswer = resolveMultipleChoiceCorrectAnswer(question.correctAnswerText, mcqOptions);

                        return (
                          <div className="space-y-3">
                            <p className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">4 lựa chọn trắc nghiệm</p>
                            <div className="space-y-2">
                              {MCQ_LABELS.map((label, optionIndex) => (
                                <div key={label} className="grid grid-cols-[28px,minmax(0,1fr)] gap-2 items-center">
                                  <span className="text-xs font-black text-[#8B5CF6]">{label}</span>
                                  <input
                                    value={mcqOptions[optionIndex] || ''}
                                    onChange={(e) => {
                                      const nextOptions = [...mcqOptions];
                                      nextOptions[optionIndex] = e.target.value;
                                      setPracticeQuestions((prev) => prev.map((item) => item.id === question.id ? {
                                        ...item,
                                        optionsText: nextOptions.join('\n'),
                                        correctAnswerText: currentAnswer === mcqOptions[optionIndex]
                                          ? e.target.value
                                          : item.correctAnswerText,
                                      } : item));
                                    }}
                                    placeholder={`Nội dung đáp án ${label}`}
                                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] font-medium"
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Đáp án đúng</p>
                              <select
                                value={mcqOptions.findIndex((opt) => opt === currentAnswer)}
                                onChange={(e) => {
                                  const pickedIndex = Number(e.target.value);
                                  const pickedAnswer = mcqOptions[pickedIndex] || '';
                                  setPracticeQuestions((prev) => prev.map((item) => item.id === question.id ? {
                                    ...item,
                                    correctAnswerText: pickedAnswer,
                                  } : item));
                                }}
                                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] text-sm font-bold"
                              >
                                <option value={-1}>Chọn đáp án đúng</option>
                                {MCQ_LABELS.map((label, optionIndex) => (
                                  <option key={label} value={optionIndex}>{label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })()}

                      {(question.type === 'CLOZE_MCQ' || question.type === 'CLOZE_TEXT') && (() => {
                        const rawBlankCount = getClozeTagCount(question.content);
                        const blankCount = Math.max(2, rawBlankCount);
                        const parsedAnswers = parseClozeAnswers(question.correctAnswerText);
                        const answers = ensureLength(parsedAnswers, blankCount);

                        if (question.type === 'CLOZE_TEXT') {
                          return (
                            <div className="space-y-3">
                              {rawBlankCount < 2 && (
                                <p className="text-xs font-bold text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-3 py-2">
                                  Nội dung cần có ít nhất [1] và [2]. Form đang hiển thị sẵn để bạn nhập trước đáp án.
                                </p>
                              )}
                              <p className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Đáp án cho từng ô trống</p>
                              <div className="space-y-2">
                                {Array.from({ length: blankCount }, (_, blankIndex) => (
                                  <div key={blankIndex} className="grid grid-cols-[72px,minmax(0,1fr)] gap-2 items-center">
                                    <span className="text-xs font-black text-[#8B5CF6]">[{blankIndex + 1}]</span>
                                    <input
                                      value={answers[blankIndex] || ''}
                                      onChange={(e) => {
                                        const nextAnswers = [...answers];
                                        nextAnswers[blankIndex] = e.target.value;
                                        setPracticeQuestions((prev) => prev.map((item) => item.id === question.id ? {
                                          ...item,
                                          correctAnswerText: serializeAnswers(nextAnswers),
                                        } : item));
                                      }}
                                      placeholder={`Đáp án cho [${blankIndex + 1}]`}
                                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] font-medium"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        const rows = getClozeMcqRowsForForm(question.optionsText, blankCount);
                        return (
                          <div className="space-y-3">
                            <p className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Danh sách đáp án lựa chọn</p>
                            <div className="space-y-3">
                              {Array.from({ length: blankCount }, (_, blankIndex) => (
                                <div key={blankIndex} className="rounded-xl border border-[#E5E7EB] p-3 space-y-2 bg-[#FAFAFA]">
                                  <p className="text-xs font-black text-[#8B5CF6]">Ô trống [{blankIndex + 1}]</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {MCQ_LABELS.map((label, optionIndex) => (
                                      <div key={label} className="grid grid-cols-[24px,minmax(0,1fr)] gap-2 items-center">
                                        <span className="text-xs font-black text-[#6B7280]">{label}</span>
                                        <input
                                          value={rows[blankIndex]?.[optionIndex] || ''}
                                          onChange={(e) => {
                                            const nextRows = rows.map((row) => [...row]);
                                            nextRows[blankIndex][optionIndex] = e.target.value;
                                            const nextAnswers = [...answers];
                                            if (nextAnswers[blankIndex] === rows[blankIndex][optionIndex]) {
                                              nextAnswers[blankIndex] = e.target.value;
                                            }
                                            setPracticeQuestions((prev) => prev.map((item) => item.id === question.id ? {
                                              ...item,
                                              optionsText: serializeClozeRows(nextRows),
                                              correctAnswerText: serializeAnswers(nextAnswers),
                                            } : item));
                                          }}
                                          placeholder={`Lựa chọn ${label}`}
                                          className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7EB] bg-white font-medium"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  <div className="space-y-1.5">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Đáp án đúng cho [{blankIndex + 1}]</p>
                                    <select
                                      value={rows[blankIndex].findIndex((opt) => opt === answers[blankIndex])}
                                      onChange={(e) => {
                                        const pickedIndex = Number(e.target.value);
                                        const nextAnswers = [...answers];
                                        nextAnswers[blankIndex] = rows[blankIndex][pickedIndex] || '';
                                        setPracticeQuestions((prev) => prev.map((item) => item.id === question.id ? {
                                          ...item,
                                          correctAnswerText: serializeAnswers(nextAnswers),
                                        } : item));
                                      }}
                                      className="w-full px-3 py-2.5 rounded-xl border border-[#E5E7EB] bg-white font-bold text-sm"
                                    >
                                      <option value={-1}>Chọn đáp án đúng</option>
                                      {MCQ_LABELS.map((label, optionIndex) => (
                                        <option key={label} value={optionIndex}>{label}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={creatingPractice}
                onClick={() => setIsPracticeModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-[#4B5563] text-xs font-black uppercase tracking-widest hover:bg-[#F9FAFA] disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={creatingPractice}
                onClick={async () => {
                  if (!isPracticePointTotalValid) {
                    window.alert(`Tổng điểm hiện tại là ${practiceTotalPoints}. Vui lòng chỉnh về đúng 10 điểm trước khi lưu.`);
                    return;
                  }

                  const payload = {
                    title: practiceTitle.trim(),
                    description: practiceDescription.trim() || undefined,
                    type: practiceType,
                    difficulty: practiceDifficulty,
                    publishStatus: practicePublishStatus,
                    questions: practiceQuestions.map((question) => {
                      const isClozeType = question.type === 'CLOZE_MCQ' || question.type === 'CLOZE_TEXT';
                      const mcqOptions = parseOptionLines(question.optionsText);
                      const clozeMcqOptions = parseClozeMcqOptionRows(question.optionsText);
                      const clozeAnswers = parseClozeAnswers(question.correctAnswerText);
                      const resolvedMcqAnswer = resolveMultipleChoiceCorrectAnswer(
                        question.correctAnswerText,
                        mcqOptions
                      );

                      return {
                        content: buildContentWithAudioTag(
                          question.content,
                          canQuestionUseAudio(question.type) && question.hasAudio,
                          question.audioLang,
                          question.audioScript
                        ),
                        type: question.type,
                        options: question.type === 'MULTIPLE_CHOICE'
                          ? mcqOptions
                          : question.type === 'CLOZE_MCQ'
                            ? clozeMcqOptions
                            : undefined,
                        correctAnswer: question.type === 'ESSAY'
                          ? null
                          : isClozeType
                            ? clozeAnswers
                            : resolvedMcqAnswer,
                        points: Number(question.points || 0),
                      };
                    }),
                  };

                  let ok = false;
                  if (editingExerciseId) {
                    ok = await updateManualPracticeExercise(editingExerciseId, payload);
                  } else {
                    ok = await createManualPracticeExercise(payload);
                  }

                  if (ok) {
                    setIsPracticeModalOpen(false);
                    setEditingExerciseId(null);
                    setPracticeTitle('');
                    setPracticeDescription('');
                    setPracticeQuestions([createPracticeQuestionDraftForExerciseType(practiceType)]);
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B45309] text-white text-xs font-black uppercase tracking-widest hover:bg-[#92400E] disabled:opacity-60"
              >
                {creatingPractice ? <Loader2 size={14} className="animate-spin" /> : <Dumbbell size={14} />}
                {creatingPractice ? (editingExerciseId ? 'Đang lưu...' : 'Đang tạo...') : (editingExerciseId ? 'Cập nhật bài tập' : 'Lưu bài luyện tập')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isReferenceModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111827]/45 backdrop-blur-sm p-4 md:p-6 flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-3xl border border-[#E5E7EB] bg-white shadow-2xl p-5 md:p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-[#1F2937]">Thêm tài liệu tham khảo</h3>
                <p className="text-sm text-[#6B7280] font-medium">Môn học và bài học được hiển thị để xác nhận, không cho phép thay đổi tại đây.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!uploadingReference) {
                    setIsReferenceModalOpen(false);
                    setSelectedReferenceFiles([]);
                  }
                }}
                className="inline-flex items-center justify-center p-2 rounded-xl text-[#6B7280] hover:bg-[#F3F4F6]"
                aria-label="Đóng cửa sổ"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Khối lớp</p>
                <input
                  disabled
                  value={selectedClassName}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] text-[#4B5563] font-bold cursor-not-allowed"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Môn học</p>
                <input
                  disabled
                  value={selectedSubjectName}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] text-[#4B5563] font-bold cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Bài học</p>
              <input
                disabled
                value={form.title || 'Bài học chưa có tên'}
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] text-[#4B5563] font-bold cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr,220px] gap-3">
              <div className="space-y-1.5">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Tên tài liệu (tùy chọn)</p>
                <input
                  value={referenceTitle}
                  onChange={(e) => setReferenceTitle(e.target.value)}
                  placeholder="Để trống sẽ lấy theo tên file"
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Trạng thái</p>
                <select
                  value={referenceStatus}
                  onChange={(e) => setReferenceStatus(e.target.value as 'DRAFT' | 'PUBLIC')}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFA] text-xs font-black uppercase tracking-widest"
                >
                  <option value="DRAFT">Bản nháp</option>
                  <option value="PUBLIC">Công khai</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[#C7D2FE] bg-[#EEF2FF] text-[#4F46E5] text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-[#E0E7FF]">
                <Upload size={14} /> Chọn tệp tài liệu
                <input
                  type="file"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files ? Array.from(e.target.files) : [];
                    setSelectedReferenceFiles(files);
                    e.currentTarget.value = '';
                  }}
                />
              </label>
              {selectedReferenceFiles.length > 0 ? (
                <div className="space-y-1">
                  {selectedReferenceFiles.slice(0, 4).map((file) => (
                    <p key={`${file.name}-${file.lastModified}`} className="text-xs text-[#374151] font-medium truncate">{file.name}</p>
                  ))}
                  {selectedReferenceFiles.length > 4 && (
                    <p className="text-xs text-[#6B7280] font-medium">+{selectedReferenceFiles.length - 4} tệp khác</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#6B7280] font-medium">Chưa chọn tệp nào.</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={uploadingReference}
                onClick={() => {
                  setIsReferenceModalOpen(false);
                  setSelectedReferenceFiles([]);
                }}
                className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-[#4B5563] text-xs font-black uppercase tracking-widest hover:bg-[#F9FAFA] disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={uploadingReference || selectedReferenceFiles.length === 0}
                onClick={async () => {
                  const ok = await uploadReferenceDocuments(
                    selectedReferenceFiles,
                    referenceTitle.trim() || undefined,
                    referenceStatus
                  );
                  if (ok) {
                    setReferenceTitle('');
                    setSelectedReferenceFiles([]);
                    setIsReferenceModalOpen(false);
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F46E5] text-white text-xs font-black uppercase tracking-widest hover:bg-[#4338CA] disabled:opacity-60"
              >
                {uploadingReference ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploadingReference ? 'Đang tải...' : 'Tải tài liệu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
