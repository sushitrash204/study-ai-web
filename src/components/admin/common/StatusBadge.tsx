'use client';

import React from 'react';

type StatusType = 'DRAFT' | 'PUBLIC' | 'PRIVATE' | string;

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    DRAFT: { 
      label: 'Bản nháp', 
      color: 'text-[#F59E0B]', 
      bg: 'bg-[#FFF7ED]', 
      dot: 'bg-[#F59E0B]' 
    },
    PUBLIC: { 
      label: 'Đã công khai', 
      color: 'text-[#10B981]', 
      bg: 'bg-[#D1FAE5]', 
      dot: 'bg-[#10B981]' 
    },
    PRIVATE: { 
      label: 'Riêng tư', 
      color: 'text-[#6B7280]', 
      bg: 'bg-[#F3F4F6]', 
      dot: 'bg-[#6B7280]' 
    }
  };

  const current = config[status] || config.DRAFT;

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full ${current.bg} ${current.color} font-black text-[12px] shadow-sm border border-transparent`}>
      <span className={`w-2 h-2 rounded-full ${current.dot} animate-pulse`}></span>
      <span>{current.label}</span>
    </div>
  );
}
