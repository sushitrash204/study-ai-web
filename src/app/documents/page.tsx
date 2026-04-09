'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLibrary } from '@/hooks/library/useLibrary';
import { 
  FileText, 
  Upload, 
  Search, 
  BookOpen, 
  Loader2,
} from 'lucide-react';
import { DocumentCard } from '@/components/library/DocumentCard';
import UploadDocumentModal from '@/components/library/UploadDocumentModal';

export default function LibraryPage() {
  const router = useRouter();
  const { state, actions } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');

  const openDocumentChat = (documentId: string, title: string) => {
    const requestId = `${documentId}-${encodeURIComponent(title)}`;
    router.push(`/chat?summaryDocumentId=${documentId}&summaryTitle=${encodeURIComponent(title)}&summaryRequestId=${requestId}`);
  };

  const {
      subjects: personalSubjectsForUpload,
      personalDocuments,
      isLoading,
      isUploading,
      modalVisible,
      selectedUploadSubjectId,
      customTitle,
  } = state;

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
           <div className="flex items-center space-x-2 text-[#8B5CF6] text-[11px] font-bold uppercase tracking-widest mb-2">
              <FileText size={16} />
              <span>Thư viện thông minh</span>
           </div>
           <h1 className="text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight">Tài liệu của tôi</h1>
        </div>

        <div className="flex items-center space-x-4">
           <button 
            onClick={() => {
              actions.setSelectedUploadSubjectId(null);
              actions.setModalVisible(true);
            }}
            className="flex items-center space-x-2 px-6 py-3.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold rounded-2xl transition-all shadow-[0_8px_20px_rgba(139,92,246,0.3)] active:scale-95"
           >
              <Upload size={20} strokeWidth={2.5} />
              <span>Nạp tài liệu mới</span>
           </button>
        </div>
      </header>

      <div className="flex items-center justify-between gap-4 bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
        <div className="relative group w-full max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8E8E93]">
              <Search size={18} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Tìm tiêu đề tài liệu..."
              className="w-full bg-[#F2F2F7] border border-[#E5E7EB] text-[#1F2937] pl-11 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] outline-none transition-all font-medium placeholder:text-[#8E8E93]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
      </div>

      {/* Library Content */}
      {isLoading && !isUploading ? (
         <div className="flex flex-col items-center justify-center py-40 animate-pulse">
            <Loader2 className="animate-spin text-[#8B5CF6] mb-4" size={40} />
            <p className="text-[#6B7280] font-medium tracking-wide">Đang tải dữ liệu...</p>
         </div>
      ) : personalDocuments.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-32 bg-white border-2 border-dashed border-[#E5E7EB] rounded-[32px]">
            <div className="w-16 h-16 bg-[#F3F4F6] rounded-[20px] flex items-center justify-center text-[#9CA3AF] mb-6">
               <BookOpen size={32} strokeWidth={1.5} />
            </div>
          <h3 className="text-[20px] font-extrabold text-[#1F2937] mb-2 tracking-tight">Chưa có tài liệu cá nhân nào</h3>
            <p className="text-[#6B7280] max-w-sm text-center font-medium leading-relaxed">Trang này chỉ hiển thị tài liệu cá nhân. Tài liệu hệ thống được xem trong từng bài học.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {personalDocuments
            .filter(doc => doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((doc) => (
             <DocumentCard
              key={doc.id}
              item={doc}
              onPress={() => router.push(`/documents/${doc.id}/view?url=${encodeURIComponent(doc.fileUrl)}&title=${encodeURIComponent(doc.title)}`)}
              onActionMenu={(e) => { e.stopPropagation(); /* Actions */ }}
              onSummary={(e) => { e.stopPropagation(); openDocumentChat(doc.id, doc.title) }}
              onGenerate={(e) => { e.stopPropagation(); router.push(`/subjects/${doc.subjectId}?openGen=${doc.id}`) }}
             />
          ))}
         </div>
      )}

      <UploadDocumentModal
        visible={modalVisible}
        onClose={() => actions.setModalVisible(false)}
        subjects={personalSubjectsForUpload}
        selectedSubjectId={selectedUploadSubjectId}
        onSelectSubject={actions.setSelectedUploadSubjectId}
        customTitle={customTitle}
        onSetCustomTitle={actions.setCustomTitle}
        onUpload={actions.handleUpload}
        isUploading={isUploading}
      />
    </main>
  );
}
