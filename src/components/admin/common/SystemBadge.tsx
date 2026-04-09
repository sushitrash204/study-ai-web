'use client';

import React from 'react';
import { Layers } from 'lucide-react';

interface SystemBadgeProps {
  isSystem: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SystemBadge({ isSystem, size = 'md' }: SystemBadgeProps) {
  const config = isSystem 
    ? { 
        label: 'Phổ thông', 
        color: 'text-[#10B981]', 
        bg: 'bg-[#D1FAE5]', 
        dot: 'bg-[#10B981]',
        icon: true
      }
    : { 
        label: 'Cá nhân', 
        color: 'text-[#8B5CF6]', 
        bg: 'bg-[#F5F3FF]', 
        dot: 'bg-[#8B5CF6]',
        icon: false
      };

  const sizeClasses = {
    sm: 'px-2 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-[12px]',
    lg: 'px-4 py-2 text-sm'
  };

  return (
    <div className={`inline-flex items-center space-x-1.5 rounded-full ${config.bg} ${config.color} font-bold ${sizeClasses[size]} shadow-sm border border-transparent`}>
      {config.icon ? (
        <Layers size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} strokeWidth={2.5} />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      )}
      <span>{config.label}</span>
    </div>
  );
}
