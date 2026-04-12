// Export all hooks

// Documents
export { useDocuments } from './documents/useDocuments';

// Exercises  
export { useExercises } from './exercises/useExercises';

// Library
export { useLibrary } from './library/useLibrary';

// Subject
export { useSubjects } from './subject/useSubjects';
export { useSubjectDetail } from './subject/useSubjectDetail';

// Exercise (legacy - sẽ được thay thế bằng useExercises)
export { useExercise } from './exercise/useExercise';
export { useExerciseSession } from './exercise/useExerciseSession';
export { useExerciseResult } from './exercise/useExerciseResult';

// Document (legacy - sẽ được thay thế bằng useDocuments)
export { useDocument } from './library/useDocument';

// Chat
export { useChat } from './chat/useChat';
export { useChatSession } from './chat/useChatSession';

// Auth
export { useAuth } from './auth/useAuth';

// Admin
export { useAdminDashboard } from './admin/useAdminDashboard';
export { useAdminClasses } from './admin/useAdminClasses';
export { useAdminSubjects } from './admin/useAdminSubjects';
export { useAdminLessons } from './admin/useAdminLessons';
export { useAdminLessonEditor } from './admin/useAdminLessonEditor';

// Stats
export { useStats } from './stats/useStats';

// Study Group
export { useGroupSocket } from './useGroupSocket';
export { useStudyGroups } from './study-groups/useStudyGroups';

// Notifications
export { useNotifications } from './notifications/useNotifications';
export { useNotificationSocket } from './notifications/useNotificationSocket';
export { useNotificationPreferences } from './notifications/useNotificationPreferences';
export { useUnreadCount } from './notifications/useUnreadCount';
