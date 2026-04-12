'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  User as UserIcon,
  Mail,
  ShieldAlert,
  Crown,
  UserX
} from 'lucide-react';
import { AdminCard, AdminStatCard } from '@/components/admin/common/AdminCard';
import { AdminActionButton } from '@/components/admin/common/AdminActionButton';
import { getAdminUsers, updateUserRole } from '@/services/adminService';
import { User } from '@/models/User';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredUsers = users.filter(u =>
    u.getFullName().toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const UserCard = ({ user }: { user: User }) => (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-violet-300 hover:shadow-lg transition-all group">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
          user.role === 'ADMIN'
            ? 'bg-amber-50'
            : 'bg-violet-50'
        }`}>
          {user.role === 'ADMIN' ? (
            <Crown size={26} className="text-amber-600" />
          ) : (
            <UserIcon size={26} className="text-violet-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-gray-900 line-clamp-1">{user.getFullName()}</h4>
          <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
            <Mail size={14} className="opacity-50" />
            <span className="truncate">{user.email}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">@{user.username}</p>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            user.role === 'ADMIN'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {user.role === 'ADMIN' ? (
              <>
                <Crown size={12} />
                ADMIN
              </>
            ) : (
              <>
                <UserIcon size={12} />
                USER
              </>
            )}
          </span>

          <button
            onClick={() => handleToggleRole(user)}
            disabled={isUpdating === user.id}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
              user.role === 'ADMIN'
                ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                : 'text-gray-500 hover:text-violet-600 hover:bg-violet-50'
            }`}
          >
            {isUpdating === user.id ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {user.role === 'ADMIN' ? <UserX size={14} /> : <ShieldCheck size={14} />}
                {user.role === 'ADMIN' ? 'Gỡ Admin' : 'Cấp Admin'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F3F5F9] pb-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8">

        {/* Header */}
        <header className="mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-600">
              <ShieldAlert size={18} strokeWidth={2.5} />
              <span className="font-black uppercase tracking-widest text-[10px]">Bảo mật & Phân quyền</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Quản lý Người dùng</h1>
            <p className="text-gray-500 font-medium text-lg">Quản lý danh sách học viên và cấp quyền cho Ban quản trị.</p>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <AdminStatCard
            label="Tổng người dùng"
            value={users.length}
            icon={Users}
            color="violet"
          />

          <AdminStatCard
            label="Admin"
            value={users.filter(u => u.role === 'ADMIN').length}
            icon={Crown}
            color="amber"
          />

          <AdminStatCard
            label="User"
            value={users.filter(u => u.role === 'USER').length}
            icon={UserIcon}
            color="blue"
          />
        </section>

        {/* Security Info Card */}
        <AdminCard
          hoverable={false}
          className="mb-8 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 py-4">
            <div className="flex-1">
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                An toàn hệ thống <ShieldCheck size={28} className="text-white" />
              </h3>
              <p className="text-white/80 font-medium mt-2">
                Chỉ Admin mới có quyền truy cập vào khu vực CMS và chỉnh sửa dữ liệu hệ thống.
              </p>
            </div>
            <ShieldAlert size={80} className="text-white/10 hidden md:block" />
          </div>
        </AdminCard>

        {/* Search */}
        <AdminCard hoverable={false} className="mb-8">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-600 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Tìm tên, email hoặc username..."
              className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 font-bold transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </AdminCard>

        {/* Users List */}
        {isLoading ? (
          <div className="space-y-6">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-white h-[120px] rounded-[32px] animate-pulse border border-white" />
            ))}
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="space-y-6">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        ) : (
          <AdminCard hoverable={false}>
            <div className="py-16 text-center">
              <Users size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-black text-lg">Không tìm thấy người dùng.</p>
              <p className="text-gray-400 font-medium text-sm mt-2">Thử tìm kiếm với từ khóa khác.</p>
            </div>
          </AdminCard>
        )}

      </div>
    </div>
  );
}
