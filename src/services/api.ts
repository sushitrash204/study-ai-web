import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Crucial for sending/receiving cookies
});

api.interceptors.request.use(
    async (config) => {
        // Get token from RAM (Zustand store)
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 Unauthorized (Avoid infinite loop with _retry)
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
            originalRequest._retry = true;

            try {
                // Call refresh endpoint - cookie is sent automatically because of withCredentials: true
                const res = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });

                const { accessToken } = res.data;

                // Update RAM state
                useAuthStore.getState().setAuth(useAuthStore.getState().user!, accessToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (err) {
                // Refresh failed - logout user
                useAuthStore.getState().logout();
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;

