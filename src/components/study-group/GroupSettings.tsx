'use client';

import React, { useState, useRef } from 'react';
import { 
  Save, 
  Camera, 
  Shield, 
  Globe, 
  Lock, 
  FileText,
  Loader2,
  Check,
  AlertCircle,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import * as studyGroupService from '@/services/studyGroupService';
import { StudyGroup } from '@/services/studyGroupService';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface GroupSettingsProps {
  group: StudyGroup;
  onUpdate: () => void;
}

export default function GroupSettings({ group, onUpdate }: GroupSettingsProps) {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const isOwner = group.ownerId === currentUser?.id;

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: group.name,
    description: group.description || '',
    isPublic: group.isPublic,
    rules: group.rules || ''
  });

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await studyGroupService.updateStudyGroup(group.id, formData);
      
      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể cập nhật thông tin nhóm');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      
      await studyGroupService.uploadAvatar(group.id, file);
      
      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải ảnh lên');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (confirmName !== group.name) return;

    try {
      setDeleteLoading(true);
      setError(null);
      await studyGroupService.deleteStudyGroup(group.id);
      router.push('/study-groups');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể xóa nhóm');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Shield className="text-indigo-600" size={20} />
            Quản trị nhóm
          </h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Tùy chỉnh linh hồn và bản sắc của nhóm bạn</p>
        </div>
        {success && (
          <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-4 py-2 rounded-xl animate-in fade-in zoom-in-95 duration-300">
            <Check size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Đã lưu thay đổi</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Core Settings */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleUpdateInfo} className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="space-y-4">
              {/* Group Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tên nhóm</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 font-bold text-gray-900 transition-all"
                  placeholder="Nhập tên nhóm..."
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mô tả mục tiêu</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 font-bold text-gray-900 transition-all min-h-[120px] resize-none"
                  placeholder="Nhóm này được tạo ra để làm gì?..."
                />
              </div>

              {/* Rules - NEW SECTION */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <FileText size={12} className="text-indigo-600" />
                  Nội quy & Quy chuẩn
                </label>
                <textarea 
                  value={formData.rules}
                  onChange={(e) => setFormData({...formData, rules: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 font-bold text-gray-900 transition-all min-h-[150px] resize-none border-l-4 border-l-indigo-200"
                  placeholder="Thiết lập các quy tắc chung để nhóm hoạt động hiệu quả hơn..."
                />
                <p className="text-[9px] text-gray-400 font-medium px-1">Người dùng sẽ nhìn thấy nội quy này ở phần thông tin nhóm.</p>
              </div>
            </div>

            {/* Privacy Toggle */}
            <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${formData.isPublic ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-gray-900 text-white shadow-gray-100'} shadow-lg transition-all`}>
                  {formData.isPublic ? <Globe size={22} /> : <Lock size={22} />}
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900 tracking-tight">{formData.isPublic ? 'Nhóm Công Khai' : 'Nhóm Riêng Tư'}</h4>
                  <p className="text-[10px] font-bold text-gray-400 leading-tight">
                    {formData.isPublic 
                      ? 'Mọi người đều có thể tìm thấy và tham gia.' 
                      : 'Chỉ những ai có mã mời mới có thể tham gia.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({...formData, isPublic: !formData.isPublic})}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${formData.isPublic ? 'bg-indigo-600' : 'bg-gray-400'}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${formData.isPublic ? 'translate-x-6' : 'translate-x-0.5'}`}
                />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 animate-shake">
                <AlertCircle size={20} />
                <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Lưu cấu hình
            </button>
          </form>

          {/* Danger Zone */}
          {isOwner && (
             <div className="bg-red-50/50 rounded-[32px] p-8 border border-red-100/50 space-y-6">
                <div>
                   <h3 className="text-red-600 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                      <AlertTriangle size={16} />
                      Vùng nguy hiểm
                   </h3>
                   <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mt-1">Cẩn trọng: Các hành động này không thể hoàn tác</p>
                </div>

                {!showConfirmDelete ? (
                   <button 
                      onClick={() => setShowConfirmDelete(true)}
                      className="w-full py-4 bg-white text-red-500 border border-red-100 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                   >
                      <Trash2 size={16} />
                      Giải tán cộng đồng này
                   </button>
                ) : (
                   <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="p-4 bg-white rounded-2xl border border-red-200">
                         <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3 text-center">
                            Nhập tên nhóm <span className="text-red-500">"{group.name}"</span> để xác nhận
                         </p>
                         <input 
                            type="text"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-center text-sm focus:ring-2 focus:ring-red-100 transition-all"
                            placeholder="Tên nhóm..."
                         />
                      </div>
                      <div className="flex gap-3">
                         <button 
                            onClick={() => {
                               setShowConfirmDelete(false);
                               setConfirmName('');
                            }}
                            className="flex-1 py-3 bg-gray-100 text-gray-400 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                         >
                            Hủy
                         </button>
                         <button 
                            disabled={deleteLoading || confirmName !== group.name}
                            onClick={handleDeleteGroup}
                            className="flex-[2] py-3 bg-red-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-600 shadow-lg shadow-red-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                         >
                            {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            Xác nhận xóa vĩnh viễn
                         </button>
                      </div>
                   </div>
                )}
             </div>
          )}
        </div>

        {/* Right Column: Visual Identity */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm text-center">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 antialiased">Ảnh đại diện nhóm</h3>
            
            <div className="relative group mx-auto w-40 h-40 mb-6">
              <div className="w-full h-full rounded-[40px] overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-700 p-1 shadow-2xl">
                <div className="w-full h-full rounded-[36px] overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center relative">
                   {group.avatarUrl ? (
                      <img src={group.avatarUrl} alt={group.name} className="w-full h-full object-cover" />
                   ) : (
                      <span className="text-4xl font-black text-white">{group.name[0]}</span>
                   )}
                   
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 shadow-xl hover:scale-110 active:scale-95 transition-all"
                      >
                         <Camera size={24} />
                      </button>
                   </div>
                </div>
              </div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-2xl border border-gray-50 hover:scale-110 active:scale-95 transition-all z-10"
              >
                <Camera size={20} />
              </button>
            </div>

            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              className="hidden"
              accept="image/*"
            />

            <div className="space-y-4 pt-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Định dạng khuyên dùng</p>
                 <p className="text-[10px] font-bold text-gray-700">Square (1:1), JPG/PNG/WebP</p>
              </div>
              <p className="text-[10px] text-gray-400 font-medium italic">
                Ảnh đại diện giúp các thành viên dễ dàng nhận diện nhóm của bạn trong danh sách phòng chat.
              </p>
            </div>
          </div>

          {/* Quick Info Tip */}
          <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
             <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
             <div className="relative z-10">
                <h4 className="font-black text-sm uppercase tracking-widest mb-3 italic">Mẹo quản trị</h4>
                <p className="text-[11px] font-bold text-indigo-100 leading-relaxed uppercase">
                  Hãy thiết lập nội quy rõ ràng để duy trì môi trường học tập tích cực và văn minh cho mọi thành viên.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
