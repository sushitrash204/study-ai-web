'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Trophy, Loader2, CheckCircle2 } from 'lucide-react';
import * as studyGroupService from '@/services/studyGroupService';
import { useAlreadyShared } from '@/hooks/study-groups/useAlreadyShared';

interface ShareResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    exerciseId: string;
    submissionId: string;
    score: number;
    totalQuestions: number;
    correctCount: number;
    onShared: () => void;
}

export default function ShareResultModal({
    isOpen,
    onClose,
    exerciseId,
    submissionId,
    score,
    totalQuestions,
    correctCount,
    onShared,
}: ShareResultModalProps) {
    const [myGroups, setMyGroups] = useState<any[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    
    // Hook kiểm tra kết quả đã chia sẻ
    const { sharedGroupIds, checkSharedStatus, isAlreadyShared } = useAlreadyShared(
        exerciseId,
        submissionId
    );

    useEffect(() => {
        if (isOpen) {
            fetchGroups();
        }
    }, [isOpen]);

    const fetchGroups = async () => {
        setFetching(true);
        try {
            const groups = await studyGroupService.getUserStudyGroups();
            setMyGroups(groups || []);
            
            // Kiểm tra các nhóm đã chia sẻ
            if (groups.length > 0) {
                const groupIds = groups.map((g: any) => g.id);
                await checkSharedStatus(groupIds);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleShare = async () => {
        if (!selectedGroupId) return;

        // Kiểm tra đã chia sẻ chưa
        if (isAlreadyShared(selectedGroupId)) {
            alert('Kết quả này đã được chia sẻ vào nhóm này trước đó. Bạn không cần chia sẻ lại.');
            return;
        }

        setLoading(true);
        try {
            await studyGroupService.shareResult(selectedGroupId, {
                exerciseId,
                submissionId,
                score,
                totalQuestions,
                correctCount,
            });
            onShared();
            onClose();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Lỗi khi chia sẻ kết quả');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <Trophy size={20} className="text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Chia sẻ kết quả</h3>
                            <p className="text-xs text-gray-500">Chọn nhóm để chia sẻ thành tích</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Score Preview */}
                <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Điểm của bạn</p>
                            <p className="text-2xl font-black text-indigo-600">{score.toFixed(1)}<span className="text-sm text-gray-400">/10</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 font-medium">Đúng / Tổng</p>
                            <p className="text-lg font-bold text-gray-900">{correctCount}/{totalQuestions}</p>
                        </div>
                    </div>
                </div>

                {/* Group Selection */}
                <div className="p-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                        Chọn nhóm học tập
                    </label>

                    {fetching ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 size={24} className="animate-spin text-indigo-600" />
                        </div>
                    ) : myGroups.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <Users size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Bạn chưa tham gia nhóm nào</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {myGroups.map((group) => {
                                const alreadyShared = isAlreadyShared(group.id);
                                const isSelected = selectedGroupId === group.id;
                                
                                return (
                                    <button
                                        key={group.id}
                                        onClick={() => {
                                            if (!alreadyShared) {
                                                setSelectedGroupId(group.id);
                                            }
                                        }}
                                        disabled={alreadyShared}
                                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                            alreadyShared
                                                ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                                                : isSelected
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                            alreadyShared
                                                ? 'bg-gray-200 text-gray-400'
                                                : isSelected
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {group.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="flex items-center gap-2">
                                                <p className={`font-bold text-sm ${
                                                    alreadyShared
                                                        ? 'text-gray-400'
                                                        : isSelected
                                                        ? 'text-indigo-900'
                                                        : 'text-gray-900'
                                                }`}>
                                                    {group.name}
                                                </p>
                                                {alreadyShared && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded-md">
                                                        <CheckCircle2 size={10} className="text-emerald-600" />
                                                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Đã chia sẻ</span>
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {group.isPublic ? 'Công khai' : 'Riêng tư'} • {group.GroupMembers?.length || 0} thành viên
                                            </p>
                                        </div>
                                        {isSelected && !alreadyShared && (
                                            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={!selectedGroupId || loading}
                        className="flex-1 px-4 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        {loading ? 'Đang chia sẻ...' : 'Chia sẻ'}
                    </button>
                </div>
            </div>
        </div>
    );
}
