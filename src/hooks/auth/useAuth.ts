import { useState } from 'react';
import * as authService from '../../services/authService';
import * as validation from '../../utils/validation';
import { useAuthStore } from '../../store/authStore';

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { setAuth, updateUser, user, isAuthenticated, logout } = useAuthStore();

    const handleLogin = async (email?: string, password?: string) => {
        setIsLoading(true);
        try {
            const { user, accessToken } = await authService.login(email!, password!);
            setAuth(user, accessToken);
            return true;
        } catch (error: any) {
            alert('Đăng nhập thất bại: ' + error.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (payload: any) => {
        setIsLoading(true);
        try {
            const { user, accessToken } = await authService.register(payload);
            setAuth(user, accessToken);
            return true;
        } catch (error: any) {
            alert('Đăng ký thất bại: ' + error.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (currentPassword?: string, newPassword?: string, confirmPassword?: string, router?: any) => {
        const error = validation.validateChangePassword(currentPassword, newPassword, confirmPassword);
        if (error) {
            alert('Lỗi: ' + error);
            return false;
        }

        setIsLoading(true);
        try {
            await authService.changePassword(currentPassword!, newPassword!);
            alert('Thành công: Đổi mật khẩu thành công');
            if (router) router.back();
            return true;
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (firstName?: string, lastName?: string, router?: any) => {
        const error = validation.validateUpdateProfile(firstName, lastName);
        if (error) {
            alert('Lỗi: ' + error);
            return false;
        }

        setIsLoading(true);
        try {
            const data = await authService.updateProfile(firstName!, lastName!);
            if (data?.user) {
                updateUser(data.user);
                alert('Thành công: Cập nhật thông tin thành công');
                if (router) router.back();
            }
            return true;
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (email: string) => {
        setIsLoading(true);
        try {
            await authService.forgotPassword(email);
            return true;
        } catch (error: any) {
            alert('Lỗi: ' + error.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        state: { isLoading, user, isAuthenticated },
        actions: { handleLogin, handleRegister, handleChangePassword, handleUpdateProfile, handleForgotPassword, logout }
    };
};

