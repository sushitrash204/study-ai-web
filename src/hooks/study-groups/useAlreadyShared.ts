import { useState, useEffect, useCallback } from 'react';
import * as studyGroupService from '@/services/studyGroupService';

/**
 * Hook kiểm tra xem kết quả bài tập đã được chia sẻ vào những nhóm nào
 * Dùng cho Next.js web app
 */
export function useAlreadyShared(exerciseId: string, submissionId: string) {
    const [sharedGroupIds, setSharedGroupIds] = useState<Set<string>>(new Set());
    const [isChecking, setIsChecking] = useState(false);

    const checkSharedStatus = useCallback(async (groupIds: string[]) => {
        if (!exerciseId || !submissionId || groupIds.length === 0) {
            setSharedGroupIds(new Set());
            return;
        }

        setIsChecking(true);
        try {
            const alreadyShared = new Set<string>();
            
            for (const groupId of groupIds) {
                try {
                    const sharedResults = await studyGroupService.getSharedResults(groupId);
                    const isShared = sharedResults.some(
                        (result: any) => 
                            result.exerciseId === exerciseId && 
                            result.submissionId === submissionId
                    );
                    
                    if (isShared) {
                        alreadyShared.add(groupId);
                    }
                } catch (error) {
                    console.error(`Error checking shared results for group ${groupId}:`, error);
                }
            }
            
            setSharedGroupIds(alreadyShared);
        } catch (error) {
            console.error('Error checking shared status:', error);
            setSharedGroupIds(new Set());
        } finally {
            setIsChecking(false);
        }
    }, [exerciseId, submissionId]);

    const isAlreadyShared = useCallback((groupId: string) => {
        return sharedGroupIds.has(groupId);
    }, [sharedGroupIds]);

    const reset = useCallback(() => {
        setSharedGroupIds(new Set());
    }, []);

    return {
        sharedGroupIds,
        isChecking,
        checkSharedStatus,
        isAlreadyShared,
        reset,
    };
}
