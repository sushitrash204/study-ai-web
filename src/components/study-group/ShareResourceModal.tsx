'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Loader2, 
  BookOpen, 
  ClipboardList,
  FileText
} from 'lucide-react';
import * as studyGroupService from '@/services/studyGroupService';
import * as documentService from '@/services/documentService';
import * as exerciseService from '@/services/exerciseService';

interface ShareResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  existingResources: any[]; // To prevent duplicate shares
  onSuccess?: () => void;
}

export default function ShareResourceModal({
  isOpen,
  onClose,
  groupId,
  existingResources,
  onSuccess
}: ShareResourceModalProps) {
  const [shareTab, setShareTab] = useState<'DOCUMENT' | 'EXERCISE'>('DOCUMENT');
  const [userResources, setUserResources] = useState<any[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [sharingResourceId, setSharingResourceId] = useState<string | null>(null);
  const [shareSubjectFilter, setShareSubjectFilter] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUserResources();
    }
  }, [isOpen, shareTab]);

  const loadUserResources = async () => {
    try {
      setLoadingResources(true);
      let data;
      if (shareTab === 'DOCUMENT') {
        data = await documentService.getAllDocuments();
      } else {
        data = await exerciseService.getAllExercises();
      }
      setUserResources(data || []);
    } catch (error) {
      console.error('Error loading user resources:', error);
    } finally {
      setLoadingResources(false);
    }
  };

  const handleShare = async (resourceId: string) => {
    try {
      setSharingResourceId(resourceId);
      await studyGroupService.shareResource(groupId, resourceId, shareTab);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error sharing resource:', error);
      alert('Không thể chia sẻ tài nguyên này.');
    } finally {
      setSharingResourceId(null);
    }
  };

  if (!isOpen) return null;

  const subjects = Array.from(new Set(userResources.map((r: any) => r.subject?.name || 'Chưa phân môn')));

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>
      <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-300 border border-white flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-8 pb-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Thư viện của bạn</h3>
            <p className="text-gray-400 font-bold text-sm">Chọn tài nguyên bạn muốn chia sẻ.</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-12 h-12 rounded-2xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="px-8 mb-6 shrink-0">
          <div className="bg-gray-50 p-1.5 rounded-2xl flex gap-1 shadow-inner">
            <button 
              onClick={() => { setShareTab('DOCUMENT'); setShareSubjectFilter(null); }}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                shareTab === 'DOCUMENT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Tài liệu cá nhân
            </button>
            <button 
              onClick={() => { setShareTab('EXERCISE'); setShareSubjectFilter(null); }}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                shareTab === 'EXERCISE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Bộ bài tập
            </button>
          </div>
        </div>

        {/* Subject Filter */}
        <div className="px-8 pb-4 shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShareSubjectFilter(null)}
              className={`shrink-0 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                !shareSubjectFilter 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-gray-400 border border-gray-100 hover:text-gray-900'
              }`}
            >
              Tất cả
            </button>
            {subjects.map(subjName => (
              <button 
                key={subjName as string}
                onClick={() => setShareSubjectFilter(subjName as string)}
                className={`shrink-0 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  shareSubjectFilter === subjName
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-white text-gray-400 border border-gray-100 hover:text-gray-900'
                }`}
              >
                {subjName as string}
              </button>
            ))}
          </div>
        </div>

        {/* Resource List */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 no-scrollbar">
          {loadingResources ? (
            <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
              <Loader2 className="animate-spin text-indigo-600 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest">Đang tải tài nguyên...</p>
            </div>
          ) : userResources.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                <Search size={32} />
              </div>
              <p className="text-gray-400 font-bold text-sm">Bạn chưa có tài nguyên nào.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(
                userResources
                  .filter((res: any) => !shareSubjectFilter || (res.subject?.name || 'Chưa phân môn') === shareSubjectFilter)
                  .reduce((acc: any, res: any) => {
                    const subjName = res.subject?.name || 'Chưa phân môn';
                    if (!acc[subjName]) acc[subjName] = [];
                    acc[subjName].push(res);
                    return acc;
                  }, {})
              ).map(([subjName, items]: [string, any]) => (
                <div key={subjName} className="space-y-3">
                  <div className="flex items-center gap-3 px-1">
                    <div className="h-px flex-1 bg-gray-100"></div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{subjName}</span>
                    <div className="h-px flex-1 bg-gray-100"></div>
                  </div>
                  <div className="space-y-2">
                    {items.map((res: any) => {
                      const isAlreadyShared = existingResources.some(
                        r => r.resourceId === res.id && r.resourceType === shareTab
                      );
                      const isSharing = sharingResourceId === res.id;

                      return (
                        <div key={res.id} className={`flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent transition-all group ${isAlreadyShared ? 'opacity-40 grayscale-[0.3]' : 'hover:border-indigo-100 hover:bg-white shadow-sm'}`}>
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 border border-gray-100 shadow-sm transition-transform group-hover:scale-105">
                              {shareTab === 'DOCUMENT' ? <FileText size={20} /> : <ClipboardList size={20} />}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-black text-gray-900 text-sm truncate uppercase tracking-tight italic">{res.title}</h4>
                              <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest leading-none mt-1">
                                {res.subject?.name || 'ChUNG'}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleShare(res.id)}
                            disabled={isSharing || isAlreadyShared}
                            className={`shrink-0 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 ${
                              isAlreadyShared 
                                ? 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                            }`}
                          >
                            {isAlreadyShared ? 'Đã trong nhóm' : (isSharing ? <Loader2 size={12} className="animate-spin" /> : 'Chia sẻ')}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
