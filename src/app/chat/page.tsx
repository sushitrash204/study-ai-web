'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useChatSession } from '@/hooks/chat/useChatSession';
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  MessageSquare, 
  Paperclip, 
  Bot, 
  Send, 
  Loader2,
  Trash2,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ChatMessage from '@/components/chat/ChatMessage';
import DocumentPickerModal from '@/components/chat/DocumentPickerModal';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

function ChatContent() {
  const searchParams = useSearchParams();
  const summaryDocumentId = searchParams.get('summaryDocumentId') || undefined;
  const summaryTitle = searchParams.get('summaryTitle') || undefined;
  
  const { state, actions } = useChatSession({
    summaryDocumentId,
    summaryTitle,
  });

  const {
    message,
    messages,
    activeDocument,
    isReplying: replying,
    isSummarizing: summarizing,
    subjects,
    pdfDocuments,
  } = state;

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, replying, summarizing]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !replying && !summarizing) {
      actions.sendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full min-h-0 overflow-hidden font-sans relative">
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {/* Sidebar - Desktop (Thread Context) */}
      <aside className={cn(
        "hidden md:flex bg-white border-r border-[#E5E7EB] flex-col overflow-hidden shadow-sm z-10 shrink-0 transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "w-16" : "w-80"
      )}>
        <div className={cn(
          "p-6 border-b border-[#E5E7EB] flex items-center transition-all duration-300",
          isSidebarCollapsed ? "justify-center px-0" : "justify-between"
        )}>
           {!isSidebarCollapsed && <h2 className="font-extrabold text-[#111827] tracking-tight text-lg animate-in fade-in duration-300">AI Assistant</h2>}
           <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="p-2 text-[#6B7280] hover:bg-[#F3F4F6] rounded-xl transition-all"
            title={isSidebarCollapsed ? "Mở rộng" : "Thu gọn"}
           >
             {isSidebarCollapsed ? <ChevronRight size={20} strokeWidth={2.5} /> : <ChevronLeft size={20} strokeWidth={2.5} />}
           </button>
        </div>

        {!isSidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-4 space-y-6 animate-in slide-in-from-left-4 duration-300">
             {/* Context Card */}
             <div className="space-y-3">
               <div className="flex items-center justify-between px-2">
                 <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-widest">Ngữ cảnh học tập</label>
                 <button onClick={actions.startNewChat} className="p-1.5 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-red-50 rounded-lg transition-all" title="Xóa hội thoại">
                   <Trash2 size={14} />
                 </button>
               </div>
               {activeDocument ? (
                  <div className="p-4 bg-[#F5F3FF] border border-[#8B5CF6]/20 rounded-2xl space-y-3 relative group">
                     <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#8B5CF6] rounded-xl flex items-center justify-center text-white shadow-sm shadow-[#8B5CF6]/30">
                           <FileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="text-sm font-bold text-[#111827] truncate">{activeDocument.title}</h4>
                           <p className="text-xs text-[#8B5CF6] font-medium mt-0.5">Đang trả lời theo PDF</p>
                        </div>
                     </div>
                     <div className="pt-2 flex flex-col gap-2">
                       <button 
                        onClick={actions.openDocumentPicker} 
                        className="w-full py-2 bg-white border border-[#DDD] hover:border-[#8B5CF6] text-[#8B5CF6] text-xs font-bold rounded-xl transition-all"
                       >
                         Đổi tài liệu
                       </button>
                       <button 
                        onClick={actions.clearDocumentContext} 
                        className="w-full py-2 text-[#EF4444] hover:bg-red-50 text-xs font-bold rounded-xl transition-all"
                       >
                         Xóa ngữ cảnh PDF
                       </button>
                     </div>
                  </div>
               ) : (
                  <div className="p-4 bg-white border border-dashed border-[#D1D5DB] rounded-2xl">
                     <p className="text-xs text-[#6B7280] text-center mb-3 font-medium">Bạn đang ở chế độ chat chung. Hãy chọn PDF để AI hỗ trợ bám sát tài liệu.</p>
                     <button 
                      onClick={actions.openDocumentPicker}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] text-xs font-bold rounded-xl transition-all"
                     >
                       <Paperclip size={16} />
                       <span>Chọn tài liệu</span>
                     </button>
                  </div>
               )}
             </div>

             <div className="p-4 bg-[#F9FAFB] rounded-2xl border border-[#EEF0F4]">
                <h4 className="text-xs font-bold text-[#374151] mb-2 flex items-center">
                  <Settings size={14} className="mr-1.5" />
                  Hướng dẫn
                </h4>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Khi chọn tài liệu, AI sẽ chỉ trả lời dựa trên nội dung có trong PDF đó. Để hỏi các kiến thức ngoài tài liệu, vui lòng xóa ngữ cảnh PDF.
                </p>
             </div>
          </div>
        )}

        {isSidebarCollapsed && (
          <div className="flex-1 flex flex-col items-center py-6 space-y-6 animate-in fade-in duration-300">
             <button 
              onClick={actions.openDocumentPicker}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                activeDocument ? "bg-[#8B5CF6] text-white" : "bg-[#F3F4F6] text-[#6B7280]"
              )}
              title={activeDocument ? activeDocument.title : "Chọn tài liệu"}
             >
                <FileText size={20} />
             </button>
             <button 
              onClick={actions.startNewChat}
              className="w-10 h-10 bg-[#F3F4F6] text-[#6B7280] rounded-xl flex items-center justify-center"
              title="Xóa hội thoại"
             >
                <Trash2 size={20} />
             </button>
          </div>
        )}
      </aside>

      <DocumentPickerModal 
        isOpen={state.pickerVisible}
        onClose={() => actions.setPickerVisible(false)}
        subjects={state.subjects}
        documents={state.documents}
        onSelect={(doc) => actions.activateDocumentContext(doc.id, doc.title)}
        activeDocumentId={activeDocument?.id}
      />

      {/* Main Chat Area */}
      <section className="flex-1 flex flex-col relative bg-[#F9FAFB] w-full min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#E5E7EB] shadow-sm z-10">
           <h2 className="font-extrabold text-[#111827] text-lg">AI Assistant</h2>
           <div className="flex items-center space-x-1">
              {activeDocument && <button onClick={actions.openContextMenu} className="p-2 text-[#6B7280]"><Paperclip size={20}/></button>}
              <button onClick={actions.startNewChat} className="p-2 text-[#8B5CF6]"><Plus size={24} strokeWidth={2.5}/></button>
           </div>
        </header>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 md:space-y-4 scroll-smooth hide-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
               <div className="w-24 h-24 bg-[#F5F3FF] rounded-[2rem] flex items-center justify-center text-[#8B5CF6] shadow-sm animate-pulse">
                  <Bot size={48} strokeWidth={1.5} />
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-[#111827] tracking-tight text-balance">Xin chào, tôi là AI Assistant</h3>
                  <p className="text-[#6B7280] leading-relaxed font-medium">
                    Hãy hỏi tôi bất kỳ điều gì, hoặc chọn tài liệu PDF để tôi hỗ trợ học tập và trả lời chuẩn xác.
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-3 w-full mt-4">
                  <button className="p-4 bg-white border border-[#E5E7EB] rounded-2xl text-left hover:border-[#8B5CF6]/50 hover:shadow-md transition-all group">
                     <p className="text-sm font-bold text-[#8B5CF6] mb-1">Tóm tắt</p>
                     <p className="text-xs text-[#6B7280] font-medium leading-snug">Tóm tắt nội dung tài liệu vừa học</p>
                  </button>
                  <button className="p-4 bg-white border border-[#E5E7EB] rounded-2xl text-left hover:border-[#10B981]/50 hover:shadow-md transition-all group">
                     <p className="text-sm font-bold text-[#10B981] mb-1">Giải đáp</p>
                     <p className="text-xs text-[#6B7280] font-medium leading-snug">Giải thích các khái niệm khó</p>
                  </button>
               </div>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage 
                key={msg.id}
                id={msg.id}
                text={msg.text}
                sender={msg.sender}
              />
            ))
          )}

          {(replying || summarizing) && (
            <div className="flex justify-start animate-fade-in">
               <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/20 flex items-center justify-center mr-3">
                  <Bot size={22} strokeWidth={1.5} />
               </div>
               <div className="p-4 md:p-5 bg-white border border-[#E5E7EB] rounded-[24px] rounded-tl-sm flex items-center space-x-3 text-[#6B7280] shadow-sm">
                  <Loader2 className="animate-spin text-[#8B5CF6]" size={18} />
                  <span className="text-sm font-medium">{summarizing ? 'Đang đọc tài liệu...' : 'AI đang suy nghĩ...'}</span>
               </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-[#E5E7EB] md:bg-transparent md:border-t-0 md:bg-gradient-to-t md:from-[#F9FAFB] md:via-[#F9FAFB] md:to-transparent">
          <form 
            onSubmit={handleSendMessage}
            className="max-w-6xl mx-auto relative flex items-end bg-[#F2F2F7] md:bg-white md:border md:border-[#E5E7EB] rounded-3xl p-1 md:p-2 focus-within:ring-2 focus-within:ring-[#8B5CF6]/30 transition-all md:shadow-xl md:shadow-black/5"
          >
            <button 
              type="button" 
              onClick={actions.openContextMenu}
              className="p-3 text-[#8E8E93] hover:text-[#8B5CF6] transition-colors mb-0.5 md:mb-1"
            >
              <Paperclip size={22} strokeWidth={2} />
            </button>
            <textarea
              rows={1}
              placeholder={activeDocument ? `Hỏi về "${activeDocument.title}"...` : "Hỏi AI bất kỳ điều gì..."}
              className="flex-1 bg-transparent border-none text-[#1F2937] px-2 py-3.5 text-[15px] focus:ring-0 outline-none resize-none max-h-32 mb-0.5 placeholder:text-[#8E8E93] font-medium"
              value={message}
              onChange={(e) => {
                actions.setMessage(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            <button 
              type="submit"
              disabled={!message.trim() || replying || summarizing}
              className={cn(
                "p-3 rounded-full md:rounded-2xl transition-all mb-0.5 md:mb-1",
                message.trim() && !replying && !summarizing
                  ? "bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/30 active:scale-95"
                  : "bg-transparent md:bg-[#F3F4F6] text-[#D1D5DB] md:text-[#9CA3AF]"
              )}
            >
              <Send size={20} className={message.trim() && !replying && !summarizing ? "translate-x-0.5 -translate-y-0.5" : ""} />
            </button>
          </form>
          <p className="hidden md:block text-center text-[10px] text-[#9CA3AF] mt-3 font-semibold tracking-wide uppercase">
            AI có thể mắc lỗi. Vui lòng kiểm chứng thông tin quan trọng.
          </p>
        </div>
      </section>
    </div>
  );
}

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[#8B5CF6] mb-4" size={40} />
                <p className="text-[#6B7280] font-semibold">Đang tải phòng chat...</p>
            </div>
        }>
            <ChatContent />
        </Suspense>
    );
}
