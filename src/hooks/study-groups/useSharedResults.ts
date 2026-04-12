import { useState, useCallback } from 'react';
import * as studyGroupService from '../../services/studyGroupService';
import { ShareResultPayload, LeaderboardPeriod, LeaderboardResponse, SharedExerciseResult } from '../../types';

/**
 * Hook quản lý việc chia sẻ kết quả bài tập vào nhóm
 */
export const useSharedResults = (groupId: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [sharedResults, setSharedResults] = useState<SharedExerciseResult[]>([]);

    // Fetch shared results
    const fetchSharedResults = useCallback(async () => {
        setIsLoading(true);
        try {
            const results = await studyGroupService.getSharedResults(groupId);
            setSharedResults(results || []);
            return results;
        } catch (error: any) {
            console.error('Fetch shared results error:', error);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [groupId]);

    // Share result
    const handleShareResult = useCallback(async (payload: ShareResultPayload) => {
        setIsLoading(true);
        try {
            const result = await studyGroupService.shareResult(groupId, payload);
            setSharedResults((prev) => [result, ...prev]);
            return result;
        } catch (error: any) {
            console.error('Share result error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [groupId]);

    // Unshare result
    const handleUnshareResult = useCallback(async (resultId: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            await studyGroupService.unshareResult(groupId, resultId);
            setSharedResults((prev) => prev.filter((r) => r.id !== resultId));
            return true;
        } catch (error: any) {
            console.error('Unshare result error:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [groupId]);

    return {
        state: { isLoading, sharedResults },
        actions: { fetchSharedResults, handleShareResult, handleUnshareResult },
    };
};

/**
 * Hook quản lý bảng xếp hạng nhóm
 */
export const useLeaderboard = (groupId: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [leaderboard, setLeaderboard] = useState<LeaderboardResponse>({
        entries: [],
        totalMembers: 0,
    });
    const [period, setPeriod] = useState<LeaderboardPeriod>('all');

    // Fetch leaderboard
    const fetchLeaderboard = useCallback(async (newPeriod?: LeaderboardPeriod) => {
        const p = newPeriod || period;
        setIsLoading(true);
        try {
            const data = await studyGroupService.getLeaderboard(groupId, p);
            setLeaderboard(data);
            setPeriod(p);
            return data;
        } catch (error: any) {
            console.error('Fetch leaderboard error:', error);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [groupId, period]);

    return {
        state: { isLoading, leaderboard, period },
        actions: { fetchLeaderboard, setPeriod },
    };
};
