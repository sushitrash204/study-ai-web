'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  Loader2,
  Info,
  AlertCircle,
  Users,
  Hash,
  Zap,
  Sparkles,
  Paperclip,
  Smile,
  FileText,
  ClipboardList,
  BookOpen,
  User,
  Calendar,
  ArrowRight,
  Trophy,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useGroupSocket } from '@/hooks/useGroupSocket';
import * as studyGroupService from '@/services/studyGroupService';
import { useAuthStore } from '@/store/authStore';
import ShareResourceModal from '@/components/study-group/ShareResourceModal';

export default function StudyGroupChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isInitializing } = useAuthStore();
  const groupId = params.id as string;

  const [groupName, setGroupName] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [sending, setSending] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [groupResources, setGroupResources] = useState<any[]>([]);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionList, setSuggestionList] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Socket hook
  const { sendMessage: socketSendMessage, status, activeUsers } = useGroupSocket({
    groupId,
    userId: user?.id || '',
    onNewMessage: (message) => {
      setMessages((prev) => [...prev, message]);
      setOffset(prev => prev + 1);
      scrollToBottom();
    },
  });

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.push('/login');
    } else if (user?.id) {
       loadMessages(true);
       fetchGroupResources();
    }
  }, [groupId, user?.id, isInitializing, isAuthenticated]);

  const fetchGroupResources = async () => {
    try {
      const data = await studyGroupService.getSharedResources(groupId);
      setGroupResources(data);
    } catch (error) {
       console.error('Error fetching resources:', error);
    }
  };

  const loadMessages = async (initial = false) => {
    try {
      if (initial) {
        setLoading(true);
        setOffset(0);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const limit = 10;
      const currentOffset = initial ? 0 : offset;
      
      const msgs = await studyGroupService.getMessages(groupId, limit, currentOffset);
      
      if (initial) {
        const groupData = await studyGroupService.getStudyGroupDetail(groupId);
        setGroupName(groupData.name);
        setGroupMembers((groupData as any).GroupMembers || []);
        setMessages(msgs);
        setOffset(msgs.length);
        if (msgs.length < limit) setHasMore(false);
        
        // Use a timeout to ensure DOM is ready before scrolling
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
          }
          isInitialLoad.current = false;
        }, 100);
      } else {
        if (msgs.length < limit) setHasMore(false);
        
        // Save previous scroll height to maintain position
        const container = scrollContainerRef.current;
        const prevHeight = container?.scrollHeight || 0;
        
        setMessages(prev => [...msgs, ...prev]); // Prepend old messages
        setOffset(prev => prev + msgs.length);

        // Adjust scroll position after prepending
        setTimeout(() => {
          if (container) {
            const newHeight = container.scrollHeight;
            container.scrollTop = newHeight - prevHeight;
          }
          setLoadingMore(false);
        }, 0);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoadingMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && hasMore && !loadingMore && !loading && !isInitialLoad.current) {
      loadMessages(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !status.connected) return;

    try {
      setSending(true);
      const text = inputText.trim();
      const replyId = replyingTo?._id;
      
      setInputText('');
      setReplyingTo(null);
      setShowSuggestions(false);

      // Send the user's message to the group first
      socketSendMessage(text, 'TEXT', undefined, replyId);
      
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    
    const lastWord = text.split(/\s/).pop() || '';
    if (lastWord.startsWith('@')) {
      const query = lastWord.slice(1).toLowerCase();
      const members = groupMembers.map(m => ({ id: m.userId, name: `${m.user?.firstName} ${m.user?.lastName}`, type: 'MEMBER' }));
      const all = [
        { id: 'ai', name: 'ai (Trợ lý học tập)', type: 'AI' },
        { id: 'summary', name: 'summary (Tóm tắt thảo luận)', type: 'AI' },
        ...members
      ];
      const filtered = all.filter(item => item.name.toLowerCase().includes(query));
      
      if (filtered.length > 0) {
        setSuggestionList(filtered);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const applySuggestion = (item: any) => {
    const words = inputText.split(/\s/);
    words.pop();
    const newText = [...words, `@${item.name.split(' (')[0]} `].join(' ').trimStart();
    setInputText(newText);
    setShowSuggestions(false);
  };

  const renderContentWithMentions = (content: string, isOwn: boolean, isAi: boolean) => {
    if (!content) return null;
    
    return (
      <div className={`markdown-content prose prose-sm max-w-none ${isOwn ? 'prose-invert text-white' : (isAi ? 'text-purple-900' : 'text-gray-800')}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            p: ({ children }: { children: React.ReactNode }) => <p className="mb-0 last:mb-0 leading-relaxed">{children}</p>,
            ul: ({ children }: { children: React.ReactNode }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
            ol: ({ children }: { children: React.ReactNode }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline ? (
                <div className="my-2 rounded-lg bg-black/10 overflow-x-auto p-3">
                  <code className="text-xs font-mono" {...props}>
                    {children}
                  </code>
                </div>
              ) : (
                <code className={`px-1 rounded ${isOwn ? 'bg-white/20' : 'bg-gray-100'} font-mono text-[0.9em]`} {...props}>
                  {children}
                </code>
              );
            },
            // Custom mention highlighting within markdown if needed
            text: ({ value }: any) => {
              const parts = value.split(/(@[\w\d.-]+)/g);
              return parts.map((part: string, index: number) => {
                if (part.startsWith('@')) {
                  return (
                    <span key={index} className="text-purple-400 font-bold">
                      {part}
                    </span>
                  );
                }
                return part;
              });
            }
          } as any}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isInitializing || !isAuthenticated || !user) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-[#F3F5F9]">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
       </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F3F5F9] overflow-hidden">
      {/* Compact Chat Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white shadow-sm sticky top-0 z-10 py-3">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/study-groups/${groupId}`)}
              className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-100">
                  <Hash size={20} />
               </div>
               <div>
                  <h1 className="font-black text-gray-900 text-sm tracking-tight leading-none">{groupName || 'Phòng học nhóm'}</h1>
                  <div className="flex items-center gap-1.5 mt-1">
                     <div className={`w-1.5 h-1.5 rounded-full ${status.connected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></div>
                     <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                        {status.connected ? `${activeUsers} trực tuyến` : 'Đang kết nối...'}
                     </p>
                  </div>
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/study-groups/${groupId}`)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-xl font-black text-[8px] uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100"
            >
              <Info size={14} />
              Thông tin
            </button>
          </div>
        </div>
      </div>

      {/* Connection Alert Area */}
      {!status.connected && (
        <div className="bg-amber-500 text-white px-6 py-2 flex items-center justify-center gap-3 animate-pulse">
          <AlertCircle size={16} />
          <span className="text-xs font-black uppercase tracking-widest">Sự cố kết nối - Đang cố gắng kết nối lại...</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {hasMore && messages.length >= 10 && (
             <div className="flex justify-center py-2">
                {loadingMore ? (
                   <Loader2 size={16} className="animate-spin text-indigo-400" />
                ) : (
                   <div className="h-4 w-4 rounded-full border border-gray-100 flex items-center justify-center">
                      <div className="w-1 h-1 bg-gray-200 rounded-full animate-bounce"></div>
                   </div>
                )}
             </div>
          )}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Đang tải...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
               <div className="w-20 h-20 bg-indigo-50 rounded-[32px] flex items-center justify-center text-indigo-400">
                  <Sparkles size={40} />
               </div>
               <div className="space-y-1">
                  <p className="text-gray-900 font-black text-lg">Chưa có tin nhắn nào</p>
                  <p className="text-gray-400 font-bold text-sm">Hãy là người đầu tiên bắt đầu cuộc trò chuyện!</p>
               </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, idx) => {
                const isOwn = msg.userId === user.id;
                const isAi = msg.userId === 'AI_ASSISTANT';
                const showAvatar = idx === 0 || messages[idx-1].userId !== msg.userId;
                
                return (
                   <div key={msg._id || msg.id || idx} className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${!showAvatar ? 'mt-1' : 'mt-4'}`}>
                     <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[9px] font-black ${
                       isOwn ? 'bg-indigo-600 text-white' : 
                       (isAi ? 'bg-purple-600 text-white' : 'bg-white text-indigo-600 border border-indigo-50 shadow-sm')
                     } ${!showAvatar && 'opacity-0'}`}>
                        {isAi ? <Sparkles size={12} /> : (msg.user?.firstName?.[0] || 'U')}
                     </div>
                     
                     <div className={`flex flex-col max-w-[85%] sm:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
                        {showAvatar && !isOwn && (
                           <span className={`text-[8px] font-black uppercase tracking-widest mb-0.5 ml-1 ${isAi ? 'text-purple-500' : 'text-gray-400'}`}>
                              {isAi ? 'Hệ thống AI' : `${msg.user?.firstName} ${msg.user?.lastName}`}
                           </span>
                        )}
                        
                        <div className={`flex items-center gap-3 group/msg ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                          {msg.type === 'TEXT' ? (
                            <div className={`px-4 py-2.5 rounded-[20px] shadow-sm relative transition-all ${
                              isOwn
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : (isAi 
                                    ? 'bg-purple-50 text-purple-900 border border-purple-100 rounded-bl-none'
                                    : 'bg-white text-gray-800 rounded-bl-none border border-white'
                                  )
                            }`}>
                              {msg.replyTo && (
                                <div className={`mb-2 p-2 rounded-lg text-[10px] border-l-2 bg-black/5 flex flex-col gap-0.5 max-w-[200px] ${isOwn ? 'border-white/50 text-white/80' : 'border-indigo-400 text-gray-500'}`}>
                                  <span className="font-black uppercase tracking-widest text-[8px]">
                                    Phản hồi từ {msg.replyTo.userId === user.id ? 'Bạn' : (msg.replyTo.user?.firstName || 'AI')}
                                  </span>
                                  <span className="truncate italic">"{msg.replyTo.content}"</span>
                                </div>
                              )}
                              <div className="font-medium leading-relaxed whitespace-pre-wrap break-words">
                                {renderContentWithMentions(msg.content, isOwn, isAi)}
                              </div>
                            </div>
                          ) : msg.type === 'RESULT' ? (
                            /* RESULT SHARED CARD */
                            <div className="bg-white rounded-[24px] border border-emerald-100 shadow-xl shadow-emerald-100/20 overflow-hidden min-w-[280px] max-w-[340px] transition-all duration-300 hover:-translate-y-1">
                              {/* Header */}
                              <div className="p-5 flex items-start gap-4 bg-gradient-to-r from-emerald-50 to-teal-50">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-100">
                                  <Trophy size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">
                                    Kết quả bài tập
                                  </p>
                                  <h4 className="text-sm font-black text-gray-900 truncate tracking-tight">
                                    {msg.resource?.exercise?.title || 'Bài tập'}
                                  </h4>
                                </div>
                              </div>

                              {/* Score Display */}
                              <div className="p-5 bg-white">
                                <div className="flex items-center justify-center gap-6">
                                  <div className="text-center">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Điểm số</p>
                                    <p className="text-3xl font-black text-emerald-600">
                                      {msg.resource?.score?.toFixed(1) || '0'}
                                      <span className="text-base text-gray-400">/10</span>
                                    </p>
                                  </div>
                                  <div className="w-px h-12 bg-gray-100" />
                                  <div className="text-center">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Đúng/Tổng</p>
                                    <p className="text-2xl font-black text-gray-900">
                                      {msg.resource?.correctCount || 0}
                                      <span className="text-sm text-gray-400">/{msg.resource?.totalQuestions || 0}</span>
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Footer */}
                              <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                  {msg.user?.firstName} {msg.user?.lastName}
                                </span>
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                  {new Date(msg.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>
                          ) : (
                            /* PROFESSIONAL DATA-RICH CARD */
                            <div className="bg-white rounded-[24px] border border-gray-100 shadow-xl shadow-indigo-100/20 overflow-hidden min-w-[300px] max-w-[380px] transition-all duration-300 hover:-translate-y-1">
                              {/* Top Section: Identity */}
                              <div className="p-5 flex items-start gap-4 bg-gray-50/80">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
                                  {msg.type === 'DOCUMENT' ? <FileText size={24} /> : <ClipboardList size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">
                                    {msg.type === 'DOCUMENT' ? 'Học liệu số' : 'Bài tập thực hành'}
                                  </p>
                                  <h4 className="text-base font-black text-gray-900 truncate tracking-tight uppercase leading-none italic">
                                    {msg.resource?.title || 'Chưa đặt tên'}
                                  </h4>
                                </div>
                              </div>

                              {/* Middle Section: Metadata Grid */}
                              <div className="p-5 grid grid-cols-2 gap-y-4 gap-x-6 border-y border-gray-50 bg-white">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                     {msg.type === 'DOCUMENT' ? <FileText size={14} /> : <Hash size={14} />}
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                                        {msg.type === 'DOCUMENT' ? 'Định dạng' : 'Số câu hỏi'}
                                     </p>
                                     <p className="text-[10px] font-bold text-gray-700 truncate">
                                        {msg.type === 'DOCUMENT' 
                                          ? (msg.resource?.fileType?.toUpperCase() || 'PDF')
                                          : `${msg.resource?.questionCount || 0} câu`}
                                     </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                     <User size={14} />
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Người gửi</p>
                                     <p className="text-[10px] font-bold text-gray-700 truncate">{msg.user?.firstName}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                     <Calendar size={14} />
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Ngày gửi</p>
                                     <p className="text-[10px] font-bold text-gray-700 truncate">
                                       {new Date(msg.createdAt).toLocaleDateString('vi-VN')}
                                     </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                                     <Zap size={14} className="fill-emerald-500" />
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Trạng thái</p>
                                     <p className="text-[10px] font-bold text-emerald-600 truncate uppercase tracking-tighter">Sẵn sàng</p>
                                  </div>
                                </div>
                              </div>

                              {/* Bottom Section: Action */}
                              <button
                                onClick={() => {
                                  if (msg.type === 'DOCUMENT') router.push(`/documents/${msg.resourceId}`);
                                  else router.push(`/practice/${msg.resourceId}`);
                                }}
                                className="w-full py-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group-hover:gap-4 active:scale-[0.98] shadow-lg shadow-indigo-100/50"
                              >
                                {msg.type === 'DOCUMENT' ? 'Truy cập tài liệu' : 'Bắt đầu làm bài'}
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          )}

                          {/* Hover Reply Button */}
                          <button 
                            onClick={() => setReplyingTo(msg)}
                            className={`p-1.5 rounded-full bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover/msg:opacity-100 ${isOwn ? 'mr-1' : 'ml-1'}`}
                            title="Phản hồi"
                          >
                            <Send size={12} className="rotate-[-45deg]" />
                          </button>

                          <span className="text-[9px] font-black text-gray-300 uppercase tracking-tighter opacity-0 group-hover/msg:opacity-100 transition-all transform translate-x-2 group-hover/msg:translate-x-0">
                             {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                     </div>
                   </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Compact Input Bar */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-white p-3 pb-6 relative">
        <div className="max-w-4xl mx-auto relative">
          
          {/* Reply Preview */}
          {replyingTo && (
            <div className="mb-2 p-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-1 bg-indigo-400 h-8 rounded-full" />
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    Đang phản hồi {replyingTo.userId === user.id ? 'chính mình' : (replyingTo.user?.firstName || 'AI')}
                  </p>
                  <p className="text-xs text-gray-500 truncate italic">"{replyingTo.content}"</p>
                </div>
              </div>
              <button 
                onClick={() => setReplyingTo(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all transform active:scale-95"
              >
                <Hash size={16} className="rotate-45" /> 
              </button>
            </div>
          )}
          
          {/* Suggestions List */}
          {showSuggestions && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden z-20 max-h-64 overflow-y-auto">
              {suggestionList.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => applySuggestion(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${idx !== suggestionList.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'AI' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                    {item.type === 'AI' ? <Sparkles size={16} /> : <User size={16} />}
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900">{item.name}</p>
                    {item.type === 'AI' && <p className="text-[10px] font-bold text-gray-400 font-mono">@ai</p>}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="relative flex items-end gap-2 bg-gray-50 rounded-[24px] p-1.5 border border-gray-100 shadow-inner group focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <button 
              onClick={() => setShowShareModal(true)}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors"
            >
               <Paperclip size={18} />
            </button>
            <textarea
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Hỏi trợ lý @ai hoặc nhắn tin cho nhóm..."
              disabled={!status.connected || sending}
              className="flex-1 px-2 py-3 bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-black placeholder:uppercase placeholder:text-[9px] placeholder:tracking-widest resize-none max-h-32 min-h-[44px]"
              rows={1}
            />
            <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors">
               <Smile size={18} />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!status.connected || sending || !inputText.trim()}
              className={`w-12 h-10 rounded-2xl flex items-center justify-center transition-all ${
                status.connected && !sending && inputText.trim()
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className={inputText.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />}
            </button>
          </div>
          <div className="px-4 mt-2 flex items-center justify-between">
             <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic">Enter to send</p>
             <div className="flex items-center gap-1.5 text-emerald-500">
                <Zap size={8} className="fill-emerald-500" />
                <p className="text-[8px] font-black uppercase tracking-widest">Live</p>
             </div>
          </div>
        </div>
      </div>

      <ShareResourceModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        groupId={groupId}
        existingResources={groupResources}
        onSuccess={() => {
          fetchGroupResources();
          // Message will arrive via socket broadcast from backend share action
        }}
      />
    </div>
  );
}
