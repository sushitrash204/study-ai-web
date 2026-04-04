'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  User as UserIcon,
  Mail,
  Calendar,
  ShieldAlert
} from 'lucide-react';
import { DataTable } from '@/components/admin/common/DataTable';
import { getAdminUsers, updateUserRole } from '@/services/adminService';
import { User } from '@/models/User';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch admin users', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleRole = async (user: User) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Bạn có chắc chắn muốn chuyển quyền của ${user.getFullName()} sang ${newRole}?`)) return;
    
    setIsUpdating(user.id);
    try {
      await updateUserRole(user.id, newRole);
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } as User : u));
    } catch (error) {
      alert('Lỗi cập nhật quyền hạn: ' + (error as any).message);
    } finally {
      setIsUpdating(null);
    }
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Người dùng',
      render: (item: User) => (
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${item.role === 'ADMIN' ? 'bg-[#FFF7ED] text-[#F59E0B]' : 'bg-[#F5F3FF] text-[#8B5CF6]'}`}>
            {item.role === 'ADMIN' ? <ShieldCheck size={20} /> : <UserIcon size={20} />}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight">{item.getFullName()}</span>
            <span className="text-xs text-gray-400 font-bold tracking-tight">@{item.username}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'email', 
      header: 'Email liên hệ',
      render: (item: User) => (
        <div className="flex items-center space-x-2 text-gray-500 font-medium text-sm">
          <Mail size={14} className="opacity-40" />
          <span>{item.email}</span>
        </div>
      )
    },
    { 
      key: 'role', 
      header: 'Phân quyền',
      render: (item: User) => (
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.role === 'ADMIN' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#E5E7EB] text-[#6B7280]'}`}>
          {item.role === 'ADMIN' ? 'Phát triển / Admin' : 'Người dùng / User'}
        </div>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (item: User) => (
        <div className="flex justify-end pr-2">
          <button 
            disabled={isUpdating === item.id}
            onClick={(e) => { e.stopPropagation(); handleToggleRole(item); }}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-black text-sm transition-all active:scale-95 disabled:opacity-50 ${
              item.role === 'ADMIN' 
                ? 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]' 
                : 'bg-[#FFF7ED] text-[#F59E0B] hover:bg-[#FFEDD5]'
            }`}
          >
            {item.role === 'ADMIN' ? 'Gỡ quyền Admin' : 'Cấp quyền Admin'}
            {isUpdating === item.id && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-2"></div>}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#EF4444]">
                <ShieldAlert size={20} strokeWidth={2.5} />
                <span className="font-black uppercase tracking-widest text-[11px]">Bảo mật & Phân quyền</span>
            </div>
            <h1 className="text-4xl font-black text-[#1F2937] tracking-tight">Quản lý Người dùng</h1>
            <p className="text-[#6B7280] font-medium text-lg">Quản lý danh sách học viên và cấp quyền cho Ban quản trị.</p>
        </div>
      </header>

      {/* Info Card */}
      <div className="bg-[#8B5CF6] p-8 rounded-[36px] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
         <div className="space-y-2 relative z-10">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
               An toàn hệ thống <ShieldCheck size={24} className="text-white" />
            </h2>
            <p className="opacity-80 font-medium">Chỉ Admin mới có quyền truy cập vào khu vực CMS và chỉnh sửa dữ liệu hệ thống.</p>
         </div>
         <div className="absolute top-0 right-10 scale-150 rotate-12 opacity-10 pointer-events-none group-hover:scale-175 transition-transform duration-700">
            <Users size={200} />
         </div>
      </div>

      {/* Table Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Tìm tên, email hoặc username..." 
                    className="w-full pl-14 pr-6 py-4 bg-white border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#8B5CF6]/10 focus:border-[#8B5CF6] font-bold transition-all"
                />
            </div>
        </div>

        <DataTable columns={columns} data={users} isLoading={isLoading} />
      </section>
    </div>
  );
}
