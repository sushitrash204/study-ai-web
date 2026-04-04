'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string; // e.g., "purple", "blue", "green", "orange"
  onClick?: () => void;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({ label, value, icon: Icon, color, onClick }) => {
  const colorMap: Record<string, string> = {
    purple: 'bg-[#8B5CF6] shadow-[0_8px_30px_rgba(139,92,246,0.2)]',
    blue: 'bg-[#3B82F6] shadow-[0_8px_30px_rgba(59,130,246,0.2)]',
    green: 'bg-[#10B981] shadow-[0_8px_30px_rgba(16,185,129,0.2)]',
    orange: 'bg-[#F59E0B] shadow-[0_8px_30px_rgba(245,158,11,0.2)]',
    red: 'bg-[#EF4444] shadow-[0_8px_30px_rgba(239,68,68,0.2)]',
    teal: 'bg-[#14B8A6] shadow-[0_8px_30px_rgba(20,184,166,0.2)]',
  };

  return (
    <div 
      onClick={onClick}
      className={`${colorMap[color]} p-6 rounded-[28px] text-white relative overflow-hidden group cursor-pointer active:scale-95 transition-all duration-300`}
    >
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-700">
        <Icon size={120} />
      </div>
      
      <div className="relative z-10 flex flex-col items-start space-y-1">
        <Icon size={24} strokeWidth={2.5} className="mb-2 opacity-80" />
        <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80">{label}</p>
        <h3 className="text-4xl leading-none font-black tracking-tight">{value}</h3>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};
