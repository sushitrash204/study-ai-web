'use client';

import React from 'react';

type StatusType = 'DRAFT' | 'PUBLIC' | 'PRIVATE';

interface AdminBadgeProps {
  status: StatusType;
}

const statusConfig: Record<StatusType, { label: string; color: string; bg: string; dot: string }> = {
  DRAFT: {
    label: 'Bản nháp',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    dot: 'bg-amber-500',
  },
  PUBLIC: {
    label: 'Đã công khai',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    dot: 'bg-emerald-500',
  },
  PRIVATE: {
    label: 'Riêng tư',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    dot: 'bg-gray-400',
  },
};

export const AdminBadge: React.FC<AdminBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || statusConfig.DRAFT;

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${config.bg} ${config.color}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
