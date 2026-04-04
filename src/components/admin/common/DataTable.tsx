'use client';

import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T extends { id: string }>({ 
  columns, 
  data, 
  onRowClick,
  isLoading 
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#E5E7EB] h-16 bg-gray-50/50 animate-pulse"></div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="p-6 border-b border-[#E5E7EB] h-20 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-white rounded-3xl border border-[#E5E7EB] p-20 flex flex-col items-center justify-center space-y-4 text-center shadow-sm">
        <div className="w-20 h-20 bg-[#F9FAFA] rounded-full flex items-center justify-center">
            <span className="text-4xl text-gray-300">📦</span>
        </div>
        <div className="space-y-1">
          <p className="text-lg font-black text-[#1F2937] tracking-tight">Không có dữ liệu</p>
          <p className="text-gray-400 font-medium">Hiện tại chưa có mục nào để hiển thị.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-sm overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-gray-50/50 border-b border-[#E5E7EB]">
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-[#6B7280]">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr 
              key={item.id}
              onClick={() => onRowClick && onRowClick(item)}
              className={`border-b border-[#E5E7EB] last:border-0 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-[#F9FAFA]' : ''}`}
            >
              {columns.map((col, i) => (
                <td key={i} className="px-6 py-5">
                  <div className="text-[15px] font-bold text-[#1F2937]">
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
