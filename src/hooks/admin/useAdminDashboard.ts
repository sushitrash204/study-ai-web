import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminStats } from '@/services/adminService';
import type { AdminStats } from '@/models/adminApi';

export const useAdminDashboard = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch admin stats', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const navigateTo = (path: string) => {
        router.push(path);
    };

    return {
        state: {
            stats,
            isLoading
        },
        actions: {
            navigateTo
        }
    };
};
