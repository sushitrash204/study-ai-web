'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminCardProps {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const AdminCard: React.FC<AdminCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-violet-600',
  iconBg = 'bg-violet-100/50',
  children,
  className = '',
  onClick,
  hoverable = true,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-[32px] border border-white shadow-sm overflow-hidden
        ${hoverable ? 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {(title || Icon) && (
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {title && (
                <h3 className="text-lg font-black text-gray-900 tracking-tight">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 font-medium mt-1">{subtitle}</p>
              )}
            </div>
            {Icon && (
              <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center shrink-0`}>
                <Icon size={24} className={iconColor} />
              </div>
            )}
          </div>
        </div>
      )}
      <div className="px-6 pb-6">
        {children}
      </div>
    </div>
  );
};

// Stat Card Component - Compact version for stats
interface AdminStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'violet' | 'indigo' | 'blue' | 'emerald' | 'orange' | 'pink' | 'red' | 'amber';
  onClick?: () => void;
}

const colorMap: Record<string, { text: string; bg: string }> = {
  violet: { text: 'text-violet-600', bg: 'bg-violet-100/50' },
  indigo: { text: 'text-indigo-600', bg: 'bg-indigo-100/50' },
  blue: { text: 'text-blue-600', bg: 'bg-blue-100/50' },
  emerald: { text: 'text-emerald-600', bg: 'bg-emerald-100/50' },
  orange: { text: 'text-orange-600', bg: 'bg-orange-100/50' },
  pink: { text: 'text-pink-600', bg: 'bg-pink-100/50' },
  red: { text: 'text-red-600', bg: 'bg-red-100/50' },
  amber: { text: 'text-amber-600', bg: 'bg-amber-100/50' },
};

export const AdminStatCard: React.FC<AdminStatCardProps> = ({
  label,
  value,
  icon: Icon,
  color = 'violet',
  onClick,
}) => {
  const colors = colorMap[color] || colorMap.violet;

  return (
    <div
      onClick={onClick}
      className={`
        bg-white p-5 rounded-[32px] border border-white shadow-sm
        flex items-center gap-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      <div className={`w-12 h-12 ${colors.bg} rounded-2xl flex items-center justify-center shrink-0`}>
        <Icon size={24} className={colors.text} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-400 font-black text-[9px] uppercase tracking-wider mb-0.5 truncate">{label}</p>
        <h4 className="text-2xl font-black text-gray-900 truncate">{value}</h4>
      </div>
    </div>
  );
};
