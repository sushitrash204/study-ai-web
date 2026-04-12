# Cấu Trúc Next-Web-App Đã Tái Cấu Trúc

## 📁 Tổng Quan

Dự án đã được tái cấu trúc để tách biệt rõ ràng giữa:
- **Models/Types**: Định nghĩa kiểu dữ liệu và class
- **Services**: Gọi API thuần túy
- **Hooks**: Quản lý business logic và state
- **Stores**: Quản lý state global (Zustand)

---

## 🏗️ Cấu Trúc Mới

### 1. Models & Types (`src/models/`)

```
src/models/
├── types/                    # ✨ MỚI - Interface TypeScript thuần
│   ├── document.ts          # Document interfaces
│   ├── exercise.ts          # Exercise interfaces  
│   ├── question.ts          # Question interfaces
│   ├── submission.ts        # Submission interfaces
│   ├── subject.ts           # Subject interfaces
│   ├── lesson.ts            # Lesson interfaces
│   ├── class.ts             # Class interfaces
│   ├── user.ts              # User interfaces
│   ├── auth.ts              # Auth interfaces
│   ├── chat.ts              # Chat interfaces
│   ├── studyGroup.ts        # Study Group interfaces (✨ MỚI)
│   └── index.ts             # Export tất cả types
│
├── Document.ts              # Document class
├── Exercise.ts              # Exercise class
├── Question.ts              # Question class
├── Submission.ts            # Submission class
├── Subject.ts               # Subject class
├── Lesson.ts                # Lesson class
├── Class.ts                 # Class class
├── User.ts                  # User class
├── AuthModel.ts             # Auth interfaces (legacy)
├── Chat.ts                  # Chat interfaces (legacy)
└── index.ts                 # Export tất cả models
```

**Cách dùng:**
```typescript
// Import types
import { DocumentData, ExerciseData, StudyGroupData } from '@/models/types';

// Import classes
import { Document, Exercise, User } from '@/models';
```

---

### 2. Services (`src/services/`)

Services vẫn giữ nguyên, chỉ chứa các hàm gọi API thuần túy:

```typescript
// Example
import * as documentService from '@/services/documentService';
import * as exerciseService from '@/services/exerciseService';
import * as studyGroupService from '@/services/studyGroupService';
```

---

### 3. Hooks (`src/hooks/`) - ✨ MỚI

```
src/hooks/
├── documents/
│   └── useDocuments.ts      # ✨ MỚI - CRUD documents
├── exercises/
│   └── useExercises.ts      # ✨ MỚI - CRUD exercises
├── study-groups/
│   └── useStudyGroups.ts    # ✨ MỚI - Study group operations
├── library/
│   ├── useLibrary.ts        # Updated - dùng hooks mới
│   └── useDocument.ts       # Legacy (vẫn hoạt động)
├── exercise/
│   ├── useExercise.ts       # Legacy (vẫn hoạt động)
│   ├── useExerciseSession.ts
│   └── useExerciseResult.ts
├── subject/
│   ├── useSubjects.ts
│   └── useSubjectDetail.ts  # Updated - dùng useExercises
├── chat/
│   ├── useChat.ts
│   └── useChatSession.ts    # Updated - dùng useDocuments
├── auth/
│   └── useAuth.ts
├── admin/
│   ├── useAdminDashboard.ts
│   ├── useAdminClasses.ts
│   ├── useAdminSubjects.ts
│   ├── useAdminLessons.ts
│   └── useAdminLessonEditor.ts
├── stats/
│   └── useStats.ts
├── useGroupSocket.ts        # Socket.io for study groups
└── index.ts                 # Export tất cả hooks
```

---

## 🎯 Cách Dùng Hooks Mới

### Documents

```typescript
import { useDocuments } from '@/hooks';

function MyComponent() {
  const { state, actions } = useDocuments({ autoFetch: true });
  
  // State
  const { documents, isLoading, isUploading, isRefreshing } = state;
  
  // Actions
  const { 
    fetchDocuments,
    fetchDocumentsBySubject,
    handleUploadDocument,
    handleDeleteDocument,
    handleUpdateTitle,
    clearDocuments
  } = actions;
  
  // Usage
  const handleUpload = async (file: File, subjectId: string) => {
    const success = await handleUploadDocument(file, subjectId, 'Title');
    if (success) alert('Thành công!');
  };
}
```

### Exercises

```typescript
import { useExercises } from '@/hooks';

function MyComponent() {
  const { state, actions } = useExercises();
  
  // State
  const { 
    exercisesBySubject,
    currentDetail,
    isStoreLoading,
    isLoading,
    isGenerating,
    isSubmitting
  } = state;
  
  // Actions
  const {
    fetchExercisesBySubject,
    fetchAllExercises,
    fetchExerciseDetail,
    handleGenerateExercise,
    handleDeleteExercise,
    handleSubmitExercise,
    clearCurrentDetail
  } = actions;
  
  // Usage
  const exercises = exercisesBySubject[subjectId] || [];
  
  const generateExercise = async () => {
    const result = await handleGenerateExercise({
      documentId: 'xxx',
      exerciseType: 'QUIZ',
      questionCount: 10,
      difficulty: 'MEDIUM'
    });
  };
}
```

### Study Groups

```typescript
import { useStudyGroups } from '@/hooks';

function MyComponent() {
  const { state, actions } = useStudyGroups({ autoFetch: true });
  
  // State
  const {
    isLoading,
    isRefreshing,
    myGroups,
    publicGroups,
    currentGroup,
    groupMembers,
    groupMessages,
    sharedResources
  } = state;
  
  // Actions
  const {
    fetchMyGroups,
    fetchPublicGroups,
    fetchGroupDetail,
    fetchGroupMembers,
    fetchGroupMessages,
    handleCreateGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleLeaveGroup,
    handleJoinByCode,
    handleShareResource,
    // ... và nhiều hơn nữa
  } = actions;
  
  // Usage
  const createGroup = async () => {
    const group = await handleCreateGroup({
      name: 'Nhóm học tập',
      description: 'Mô tả nhóm',
      isPublic: true
    });
  };
}
```

---

## 🔄 Migration Guide

### Từ useDocument → useDocuments

```typescript
// ❌ CŨ
import { useDocument } from '@/hooks/library/useDocument';
const { state, actions } = useDocument({ autoFetch: true });

// ✅ MỚI
import { useDocuments } from '@/hooks';
const { state, actions } = useDocuments({ autoFetch: true });

// Actions mới:
// - fetchDocuments(isRefresh?)
// - fetchDocumentsBySubject(subjectId)
// - handleUploadDocument(file, subjectId, title?)
// - handleDeleteDocument(doc)
// - handleUpdateTitle(doc, newTitle)
// - clearDocuments()
```

### Từ useExercise → useExercises

```typescript
// ❌ CŨ
import { useExercise } from '@/hooks/exercise/useExercise';
const { state, actions } = useExercise();

// ✅ MỚI
import { useExercises } from '@/hooks';
const { state, actions } = useExercises();

// Actions mới:
// - fetchExercisesBySubject(subjectId, silent?)
// - fetchAllExercises(silent?)  ← MỚI
// - fetchExerciseDetail(exerciseId)
// - handleGenerateExercise(data)
// - handleDeleteExercise(exercise)
// - handleSubmitExercise(exerciseId, answers)
// - clearCurrentDetail()
```

---

## ✅ Ưu Điểm Của Cấu Trúc Mới

1. **Tách biệt rõ ràng**: Types ≠ Models ≠ Services ≠ Hooks
2. **Dễ bảo trì**: Mỗi hook quản lý một domain riêng
3. **Type-safe**: Tất cả interfaces được định nghĩa rõ ràng trong `types/`
4. **Reusability**: Hooks có thể dùng lại ở nhiều nơi
5. **Testable**: Dễ viết unit tests cho từng layer
6. **Scalable**: Dễ dàng thêm tính năng mới (như Study Groups)

---

## 📝 Lưu Ý

- Các hooks cũ (`useDocument`, `useExercise`) vẫn hoạt động để đảm bảo backward compatibility
- Nên dần chuyển sang dùng hooks mới (`useDocuments`, `useExercises`)
- Tất cả hooks đều có thể import từ `@/hooks` (index file)

---

## 🚀 Next Steps

1. ✅ Tạo types cho Study Groups
2. ✅ Tạo hook `useStudyGroups`
3. ✅ Cập nhật `useLibrary` dùng hooks mới
4. ✅ Cập nhật `useChatSession` dùng hooks mới
5. ✅ Cập nhật `useSubjectDetail` dùng hooks mới
6. ⏳ Cập nhật các page components nếu cần
7. ⏳ Viết unit tests cho hooks mới

---

**Ngày tái cấu trúc**: 2026-04-11
**Người thực hiện**: Qwen Code AI
