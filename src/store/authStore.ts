import { create } from 'zustand';
import storage from '../utils/storage';
import { User } from '../models/User';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    setAuth: (user: User, accessToken: string) => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isInitializing: true,

    initialize: async () => {
        // Prevent multiple initialization calls
        if (get().isAuthenticated && !get().isInitializing) return;
        
        try {
            set({ isInitializing: true });
            const storedUser = await storage.getItem('user');

            if (storedUser) {
                const user = new User(JSON.parse(storedUser));
                // Set the cached user and assume authenticated while we verify with server
                set({ user, isAuthenticated: true }); 

                // Trigger silent refresh via an API call (handled by interceptor or manual call)
                // We'll import api here dynamically to avoid circular dependencies if needed, 
                // but better to just trigger it.
                const { default: api } = await import('../services/api');
                try {
                    const res = await api.post('/auth/refresh');
                    const { accessToken, user: freshUserData } = res.data;
                    const user = new User(freshUserData);
                    set({ user, accessToken, isAuthenticated: true, isInitializing: false });
                    await storage.setItem('user', JSON.stringify(user));
                } catch (err) {
                    // Refresh failed (cookie expired or invalid)
                    set({ user: null, accessToken: null, isAuthenticated: false, isInitializing: false });
                    await storage.removeItem('user');
                }
            } else {
                set({ isInitializing: false });
            }
        } catch (error) {
            console.error('Error loading auth from storage', error);
            set({ isInitializing: false });
        }
    },

    setAuth: async (user, accessToken) => {
        set({
            user,
            accessToken,
            isAuthenticated: true
        });
        await storage.setItem('user', JSON.stringify(user));
    },

    updateUser: async (user) => {
        set({ user });
        await storage.setItem('user', JSON.stringify(user));
    },

    logout: async () => {
        const { default: api } = await import('../services/api');
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout API call failed', err);
        }

        set({
            user: null,
            accessToken: null,
            isAuthenticated: false
        });
        await storage.removeItem('user');
    }
}));

