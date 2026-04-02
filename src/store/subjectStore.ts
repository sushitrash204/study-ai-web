import { create } from 'zustand';
import { Subject } from '../models/Subject';

interface SubjectState {
    subjects: Subject[];
    isLoading: boolean;
    setSubjects: (subjects: Subject[]) => void;
    addSubject: (subject: Subject) => void;
    updateSubject: (updated: Subject) => void;
    deleteSubject: (id: string) => void;
    setLoading: (loading: boolean) => void;
}

export const useSubjectStore = create<SubjectState>((set) => ({
    subjects: [],
    isLoading: false,

    setSubjects: (subjects) => set({ subjects }),
    
    addSubject: (subject) => set((state) => ({
        subjects: [...state.subjects, subject]
    })),
    
    updateSubject: (updated) => set((state) => ({
        subjects: state.subjects.map(s => s.id === updated.id ? updated : s)
    })),
    
    deleteSubject: (id) => set((state) => ({
        subjects: state.subjects.filter(s => s.id !== id)
    })),

    setLoading: (loading) => set({ isLoading: loading })
}));
