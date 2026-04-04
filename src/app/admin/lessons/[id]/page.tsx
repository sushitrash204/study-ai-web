'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FileText, 
  BrainCircuit, 
  ArrowLeft, 
  Upload, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  BookMarked,
  Layout
} from 'lucide-react';
import { StatusBadge } from '@/components/admin/common/StatusBadge';
import { LessonModel } from '@/models/Lesson';
// We'll need specialized services for lesson materials
import api from '@/services/api';

export default function AdminLessonDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonModel | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'docs' | 'exercises'>('docs');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch Lesson details (Increase limit temporarily to find the lesson in the list)
      // Ideally we should have a dedicated /admin/lessons/:id endpoint
      const response = await api.get(`/admin/lessons?limit=100`);
      const rows = response.data.rows || [];
      const allLessons = rows.map((l: any) => new LessonModel(l));
      const found = allLessons.find((l: LessonModel) => l.id === id);
      setLesson(found || null);
    } catch (error) {
      console.error('Failed to fetch lesson details', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (isLoading) return <div className="p-10 animate-pulse">Loading...</div>;
  if (!lesson) return <div className="p-10">Bài học không tồn tại.</div>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Navigation & Header */}
      <nav className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-500 hover:text-[#8B5CF6] font-bold transition-all group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại</span>
        </button>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-2xl border border-[#E5E7EB] shadow-sm">
           <span className="text-xs font-black text-gray-400 uppercase">Trạng thái:</span>
           <StatusBadge status={lesson.status} />
        </div>
      </nav>

      <header className="space-y-4">
        <div className="flex items-center space-x-3">
           <div className="w-12 h-12 bg-[#F5F3FF] rounded-2xl flex items-center justify-center text-[#8B5CF6]">
              <BookMarked size={28} strokeWidth={2.5} />
           </div>
           <div className="flex flex-col">
              <h1 className="text-3xl font-black text-[#1F2937] tracking-tight">{lesson.title}</h1>
              <div className="flex items-center space-x-3 text-sm font-bold text-gray-400">
                 <span>{lesson.class?.name}</span>
                 <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                 <span>{lesson.subject?.name}</span>
              </div>
           </div>
        </div>
        <p className="text-[#6B7280] font-medium max-w-2xl">{lesson.description || 'Chưa có mô tả cho bài học này.'}</p>
      </header>

      {/* Tabs */}
      <div className="flex bg-[#F3F4F6] p-1.5 rounded-[24px] w-full md:w-fit gap-1">
         <button 
            onClick={() => setActiveTab('docs')}
            className={`flex items-center space-x-2 px-8 py-3.5 rounded-[20px] font-black text-sm transition-all ${activeTab === 'docs' ? 'bg-white shadow-md text-[#8B5CF6]' : 'text-gray-400 hover:text-[#1F2937]'}`}
         >
            <FileText size={18} strokeWidth={2.5} />
            <span>Tài liệu học</span>
         </button>
         <button 
            onClick={() => setActiveTab('exercises')}
            className={`flex items-center space-x-2 px-8 py-3.5 rounded-[20px] font-black text-sm transition-all ${activeTab === 'exercises' ? 'bg-white shadow-md text-[#8B5CF6]' : 'text-gray-400 hover:text-[#1F2937]'}`}
         >
            <BrainCircuit size={18} strokeWidth={2.5} />
            <span>Bài tập củng cố</span>
         </button>
      </div>

      {/* Tab Content Placeholder */}
      <div className="mt-8">
        {activeTab === 'docs' ? (
           <div className="bg-white border border-[#E5E7EB] rounded-[36px] p-12 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="w-24 h-24 bg-[#F9FAFA] rounded-full flex items-center justify-center">
                 <FileText size={48} className="text-gray-200" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black text-[#1F2937]">Chưa có tài liệu</h3>
                 <p className="text-gray-500 font-medium max-w-xs">Hãy tải lên tài liệu PDF hoặc bài giảng để học sinh bắt đầu nghiên cứu.</p>
              </div>
              <button className="flex items-center space-x-2 px-8 py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-[24px] font-black transition-all active:scale-95 shadow-lg shadow-purple-500/20">
                 <Upload size={20} strokeWidth={3} />
                 <span>Tải tài liệu mới</span>
              </button>
           </div>
        ) : (
           <div className="bg-white border border-[#E5E7EB] rounded-[36px] p-12 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="w-24 h-24 bg-[#F9FAFA] rounded-full flex items-center justify-center">
                 <BrainCircuit size={48} className="text-gray-200" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black text-[#1F2937]">Chưa có bài tập</h3>
                 <p className="text-gray-500 font-medium max-w-xs">Tạo các bài tập trắc nghiệm hoặc tự luận để kiểm tra kiến thức.</p>
              </div>
              <button className="flex items-center space-x-2 px-8 py-4 bg-[#1F2937] hover:bg-[#111827] text-white rounded-[24px] font-black transition-all active:scale-95 shadow-lg shadow-gray-500/20">
                 <Plus size={20} strokeWidth={3} />
                 <span>Tạo bài tập</span>
              </button>
           </div>
        )}
      </div>
    </div>
  );
}
