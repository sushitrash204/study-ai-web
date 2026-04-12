'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLibrary } from '@/hooks/library/useLibrary';
import { 
  Upload, 
  Search, 
  Loader2,
  Plus,
  Lightbulb,
  Zap,
  Book,
  X
} from 'lucide-react';
import { DocumentCard } from '@/components/library/DocumentCard';
import UploadDocumentModal from '@/components/library/UploadDocumentModal';

export default function LibraryPage() {
  const router = useRouter();
  const { state, actions } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTips, setShowTips] = useState(true);

  const openDocumentChat = (documentId: string, title: string) => {
    const requestId = `${documentId}-${encodeURIComponent(title)}`;
    router.push(`/chat?summaryDocumentId=${documentId}&summaryTitle=${encodeURIComponent(title)}&summaryRequestId=${requestId}`);
  };

  const {
      subjects: personalSubjectsForUpload,
      sections,
      filteredSections,
      personalDocuments,
      isLoading,
      isUploading,
      modalVisible,
      selectedUploadSubjectId,
      selectedSubjectId,
      customTitle,
  } = state;

  return (
    <main className="flex-1 max-w-[1300px] mx-auto w-full p-6 md:p-10 space-y-8 animate-in fade-in duration-500 bg-[#F9FAFA] min-h-screen relative pb-24">
      
      {/* Refined Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
           <div className="flex items-center gap-2.5 text-indigo-600 font-black text-[10px] uppercase tracking-[0.15em]">
              <div className="w-5 h-1 bg-indigo-600 rounded-full"></div>
              <span>Thư viện thông minh</span>
           </div>
           <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Tài liệu của tôi</h1>
        </div>

        <button 
          onClick={() => {
            actions.setSelectedUploadSubjectId(null);
            actions.setModalVisible(true);
          }}
          className="flex items-center gap-2.5 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-100 active:scale-95 text-sm"
        >
          <Upload size={18} />
          <span>Nạp tài liệu mới</span>
        </button>
      </header>

      {/* Modern Search Bar & Subject Filter */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 bg-white p-2 rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="relative flex-1">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Tìm tên tài liệu, môn học..."
                className="w-full bg-transparent border-none text-gray-900 pl-14 pr-4 py-3.5 outline-none font-bold text-sm placeholder:text-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
        </div>

        {/* Horizontal Subject Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
           <button
              onClick={() => actions.setSelectedSubjectId(null)}
              className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedSubjectId === null 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-100'
              }`}
           >
              Tất cả
           </button>
           {sections.map((section) => (
             <button
                key={section.id}
                onClick={() => actions.setSelectedSubjectId(section.id)}
                className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-3 ${
                  selectedSubjectId === section.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-100'
                }`}
             >
                <div 
                   className="w-2 h-2 rounded-full" 
                   style={{ backgroundColor: selectedSubjectId === section.id ? 'white' : section.color }}
                ></div>
                {section.title}
             </button>
           ))}
        </div>
      </div>

      {/* Categorized Library Content */}
      {isLoading && !isUploading ? (
         <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Đang chuẩn bị kho kiến thức...</p>
         </div>
      ) : filteredSections.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-32 bg-white border-2 border-dashed border-gray-100 rounded-[32px]">
            <div className="w-16 h-16 bg-gray-50 rounded-[20px] flex items-center justify-center text-gray-300 mb-4">
               <Book size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">Thư viện trống</h3>
            <p className="text-gray-400 text-sm font-medium">Hãy nạp tài liệu cho môn học này để bắt đầu!</p>
         </div>
      ) : (
        <div className="space-y-12">
          {filteredSections.map((section) => {
            const displayDocs = section.data.filter(doc => 
              doc.title.toLowerCase().includes(searchQuery.toLowerCase())
            );

            if (displayDocs.length === 0) return null;

            return (
              <section key={section.id} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div 
                        className="w-1.5 h-6 rounded-full" 
                        style={{ backgroundColor: section.color }}
                     ></div>
                     <h2 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-3">
                        {section.title}
                        <span className="text-[10px] font-black bg-gray-100 text-gray-400 px-2 py-0.5 rounded-md uppercase">
                          {displayDocs.length} tài liệu
                        </span>
                     </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayDocs.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      item={doc}
                      onPress={() => router.push(`/documents/${doc.id}/view?url=${encodeURIComponent(doc.fileUrl)}&title=${encodeURIComponent(doc.title)}`)}
                      onActionMenu={(e, action) => { 
                        e.stopPropagation();
                        if (action === 'DELETE') {
                          actions.handleDeleteDocument(doc);
                        } else if (action === 'RENAME') {
                          const newTitle = window.prompt('Nhập tên mới:', doc.title);
                          if (newTitle?.trim()) actions.handleUpdateTitle(doc, newTitle.trim());
                        }
                      }}
                      onSummary={(e) => { e.stopPropagation(); openDocumentChat(doc.id, doc.title) }}
                      onGenerate={(e) => { e.stopPropagation(); router.push(`/subjects/${doc.subjectId}?openGen=${doc.id}`) }}
                    />
                  ))}
                  
                  {/* Local Quick Add */}
                  <div 
                    onClick={() => {
                      actions.setSelectedUploadSubjectId(section.id);
                      actions.setModalVisible(true);
                    }}
                    className="group border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center p-8 hover:border-indigo-400 hover:bg-white transition-all cursor-pointer duration-300 bg-gray-50/10 min-h-[220px]"
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-300 group-hover:text-indigo-600 transition-all mb-4 shadow-sm">
                      <Plus size={20} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Nạp vào {section.title}</p>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Compact Dismissible AI Tips Widget */}
      {showTips && (
        <div className="fixed bottom-6 left-6 z-[60] max-w-[300px] hidden xl:block animate-in slide-in-from-left-5 duration-700">
           <div className="bg-white rounded-[28px] p-5 shadow-2xl border border-indigo-50 flex items-start gap-3 relative group/tips">
              <button 
                 onClick={() => setShowTips(false)}
                 className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/tips:opacity-100"
              >
                 <X size={14} />
              </button>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
                 <Lightbulb size={20} />
              </div>
              <div className="space-y-0.5">
                 <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">AI Mentor Tips</p>
                 <p className="text-[11px] font-bold text-gray-600 leading-normal">
                   Chào bạn! Thư viện đang có <span className="text-indigo-600">{personalDocuments.length} tài liệu</span>. Hãy xem ngay để ôn tập hiệu quả!
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* Compact FAB */}
      <div className="fixed bottom-6 right-6 z-10">
         <button className="w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group">
            <Zap size={24} fill="white" className="group-hover:rotate-12 transition-transform" />
         </button>
      </div>

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
