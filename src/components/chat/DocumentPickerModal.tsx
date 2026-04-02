'use client';

import React, { useState } from 'react';
import { X, Search, FileText, Check, ChevronRight } from 'lucide-react';
import { Subject } from '@/models/Subject';
import { Document } from '@/models/Document';

interface DocumentPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  documents: Document[];
  onSelect: (doc: Document) => void;
  activeDocumentId?: string;
}

export default function DocumentPickerModal({
  isOpen,
  onClose,
  subjects,
  documents,
  onSelect,
  activeDocumentId
}: DocumentPickerModalProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    subjects.length > 0 ? subjects[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredDocuments = documents.filter(doc => {
    const matchesSubject = selectedSubjectId ? doc.subjectId === selectedSubjectId : true;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const isPDF = (doc.fileType || '').toLowerCase() === 'pdf';
    return matchesSubject && matchesSearch && isPDF;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#F2F2F7] flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-[#1F2937]">Chọn tài liệu học tập</h2>
            <p className="text-sm text-[#6B7280] font-medium mt-0.5">AI sẽ trả lời bám sát nội dung PDF bạn chọn</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-[#F2F2F7] hover:bg-[#E5E7EB] text-[#6B7280] rounded-full transition-all active:scale-90"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Subjects Sidebar */}
          <div className="w-1/3 border-r border-[#F2F2F7] bg-[#F9FAFA] overflow-y-auto p-3 space-y-1">
            <label className="px-3 py-2 text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">Môn học</label>
            {subjects.map(subject => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  selectedSubjectId === subject.id 
                    ? 'bg-white text-[#8B5CF6] shadow-sm ring-1 ring-[#8B5CF6]/10' 
                    : 'text-[#6B7280] hover:bg-white/60'
                }`}
              >
                {subject.name}
              </button>
            ))}
          </div>

          {/* Documents Area */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            <div className="p-4 border-b border-[#F2F2F7]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
                <input
                  type="text"
                  placeholder="Tìm tên tài liệu..."
                  className="w-full bg-[#F2F2F7] border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 bg-[#F2F2F7] rounded-full flex items-center justify-center mb-3">
                    <FileText size={24} className="text-[#D1D5DB]" />
                  </div>
                  <p className="text-sm font-bold text-[#9CA3AF]">Không tìm thấy tài liệu PDF nào</p>
                </div>
              ) : (
                filteredDocuments.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => onSelect(doc)}
                    className={`w-full flex items-center p-3.5 rounded-2xl border transition-all text-left group ${
                      activeDocumentId === doc.id
                        ? 'bg-[#F5F3FF] border-[#8B5CF6] shadow-sm'
                        : 'bg-white border-[#EEF0F4] hover:border-[#8B5CF6]/30 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 transition-colors ${
                       activeDocumentId === doc.id ? 'bg-[#8B5CF6] text-white' : 'bg-[#F2F2F7] text-[#6B7280] group-hover:bg-[#F5F3FF] group-hover:text-[#8B5CF6]'
                    }`}>
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${activeDocumentId === doc.id ? 'text-[#8B5CF6]' : 'text-[#1F2937]'}`}>
                        {doc.title}
                      </p>
                      <p className="text-[11px] text-[#9CA3AF] font-medium mt-0.5">Tài liệu PDF</p>
                    </div>
                    {activeDocumentId === doc.id ? (
                      <div className="w-6 h-6 bg-[#8B5CF6] rounded-full flex items-center justify-center text-white">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    ) : (
                      <ChevronRight size={18} className="text-[#D1D5DB] group-hover:text-[#8B5CF6] transition-colors" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F9FAFA] border-t border-[#F2F2F7] flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-[#E5E7EB] text-[#1F2937] font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
