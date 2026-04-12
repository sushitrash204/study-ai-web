'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminActionButtonProps {
  icon: LucideIcon;
  label?: string;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<string, string> = {
  default: 'text-gray-500 hover:text-violet-600 hover:bg-violet-50',
  danger: 'text-gray-500 hover:text-red-600 hover:bg-red-50',
  success: 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50',
  warning: 'text-gray-500 hover:text-amber-600 hover:bg-amber-50',
};

const sizeStyles: Record<string, { padding: string; iconSize: number }> = {
  sm: { padding: 'p-2', iconSize: 16 },
  md: { padding: 'p-2.5', iconSize: 18 },
  lg: { padding: 'p-3', iconSize: 20 },
};

export const AdminActionButton: React.FC<AdminActionButtonProps> = ({
  icon: Icon,
  label,
  variant = 'default',
  onClick,
  disabled = false,
  loading = false,
  size = 'md',
}) => {
  const styles = sizeStyles[size];
  const variantClass = variantStyles[variant] || variantStyles.default;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${styles.padding} rounded-xl transition-all active:scale-95
        ${variantClass}
        ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}
        ${label ? 'flex items-center gap-2 px-4' : ''}
      `}
      title={label}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Icon size={styles.iconSize} strokeWidth={2.5} />
      )}
      {label && <span className="text-xs font-black uppercase tracking-wider">{label}</span>}
    </button>
  );
};
