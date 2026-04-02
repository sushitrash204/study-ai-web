
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (!password || password.trim().length === 0) {
        return { isValid: false, message: 'Vui lòng nhập mật khẩu.' };
    }
    if (password.length < 6) {
        return { isValid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' };
    }
    return { isValid: true, message: '' };
};

export const validateConfirmPassword = (pass: string, confirmPass: string): { isValid: boolean; message: string } => {
    if (pass !== confirmPass) {
        return { isValid: false, message: 'Mật khẩu xác nhận không khớp.' };
    }
    return { isValid: true, message: '' };
};

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isRequiredFilled = (...fields: (string | undefined | null)[]): boolean => {
    return fields.every(field => field && field.trim().length > 0);
};

/**
 * Xác thực dữ liệu khi đổi mật khẩu
 */
export const validateChangePassword = (current?: string, newPass?: string, confirmPass?: string): string | null => {
    if (!current || !newPass || !confirmPass) {
        return 'Vui lòng nhập đầy đủ các trường mật khẩu';
    }
    
    const passCheck = validatePassword(newPass);
    if (!passCheck.isValid) return passCheck.message;

    const confirmCheck = validateConfirmPassword(newPass, confirmPass);
    if (!confirmCheck.isValid) return confirmCheck.message;

    return null;
};

/**
 * Xác thực dữ liệu cập nhật hồ sơ
 */
export const validateUpdateProfile = (firstName?: string, lastName?: string): string | null => {
    if (!firstName || !lastName || firstName.trim() === '' || lastName.trim() === '') {
        return 'Vui lòng nhập đầy đủ họ và tên';
    }
    return null;
};
