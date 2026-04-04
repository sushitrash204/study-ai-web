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
  Layers,
} from 'lucide-react';
import FilterChip from '@/components/common/FilterChip';
import { DocumentCard } from '@/components/library/DocumentCard';
import UploadDocumentModal from '@/components/library/UploadDocumentModal';

export default function LibraryPage() {
  const router = useRouter();
  const { state, actions } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');

  const {
      filteredSections,
      selectedSubjectId,
      selectedClassId,
      classes,
      filteredSubjectsForUpload,
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
           <h1 className="text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight">Bài giảng & Tài liệu</h1>
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
              <span>Nạp dữ liệu mới</span>
           </button>
        </div>
      </header>

      {/* Main Filter - Grade Level */}
      <div className="flex flex-col space-y-4 bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-2 text-gray-500 mb-1">
          <Layers size={16} />
          <span className="text-[11px] font-bold uppercase tracking-wider">Chọn khối lớp quản lý</span>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar text-nowrap">
          <FilterChip
            label="Tất cả khối"
            selected={!selectedClassId}
            onClick={() => {
               actions.setSelectedClassId(null);
               actions.setSelectedSubjectId(null);
            }}
          />
          {classes.map((cls) => (
            <FilterChip
              key={cls.id}
              label={cls.name}
              selected={selectedClassId === cls.id}
              onClick={() => {
                actions.setSelectedClassId(cls.id);
                actions.setSelectedSubjectId(null);
              }}
            />
          ))}
        </div>

        <div className="h-px bg-gray-100 my-2"></div>

        {/* Sub Filter - Subjects in Grade */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar text-nowrap">
              <FilterChip
                label="Tất cả môn"
                selected={!selectedSubjectId}
                onClick={() => actions.setSelectedSubjectId(null)}
              />
              {state.sections.map((section) => (
                <FilterChip
                    key={section.id}
                    label={section.className ? `${section.title} (${section.className})` : section.title}
                    selected={selectedSubjectId === section.id}
                    onClick={() => actions.setSelectedSubjectId(section.id)}
                    color={section.color}
                    count={section.data.length}
                />
              ))}
          </div>

          <div className="relative group min-w-[300px]">
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
      </div>

      {/* Library Content */}
      {isLoading && !isUploading ? (
         <div className="flex flex-col items-center justify-center py-40 animate-pulse">
            <Loader2 className="animate-spin text-[#8B5CF6] mb-4" size={40} />
            <p className="text-[#6B7280] font-medium tracking-wide">Đang tải dữ liệu...</p>
         </div>
      ) : filteredSections.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-32 bg-white border-2 border-dashed border-[#E5E7EB] rounded-[32px]">
            <div className="w-16 h-16 bg-[#F3F4F6] rounded-[20px] flex items-center justify-center text-[#9CA3AF] mb-6">
               <BookOpen size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-[20px] font-extrabold text-[#1F2937] mb-2 tracking-tight">Chưa có bài học nào</h3>
            <p className="text-[#6B7280] max-w-sm text-center font-medium leading-relaxed">Vui lòng chọn khối lớp và môn học để quản lý tài liệu bám sát chương trình.</p>
         </div>
      ) : (
         <div className="space-y-12">
            {filteredSections.map((section) => (
               <section key={section.id} className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                     <div className="flex items-center space-x-3">
                        <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: section.color }}></div>
                        <h2 className="text-xl font-black text-[#1F2937] flex items-center space-x-2 tracking-tight uppercase">
                           <span>{section.title}</span>
                           {section.className && (
                             <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-md text-gray-500 font-bold ml-2">{section.className}</span>
                           )}
                           <span className="text-sm font-bold text-[#8E8E93] ml-2">({section.data.length})</span>
                        </h2>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                     {section.data
                      .filter(doc => doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((doc) => (
                        <DocumentCard
                          key={doc.id}
                          item={doc}
                          onPress={() => router.push(`/documents/${doc.id}/view?url=${encodeURIComponent(doc.fileUrl)}&title=${encodeURIComponent(doc.title)}`)}
                          onActionMenu={(e) => { e.stopPropagation(); /* Actions */ }}
                          onSummary={(e) => { e.stopPropagation(); router.push(`/documents/${doc.id}/summary`) }}
                          onGenerate={(e) => { e.stopPropagation(); router.push(`/subjects/${section.id}?openGen=${doc.id}`) }}
                        />
                     ))}
                  </div>
               </section>
            ))}
         </div>
      )}

      <UploadDocumentModal
        visible={modalVisible}
        onClose={() => actions.setModalVisible(false)}
        classes={classes}
        selectedClassId={selectedClassId}
        onSelectClass={actions.setSelectedClassId}
        subjects={filteredSubjectsForUpload}
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
