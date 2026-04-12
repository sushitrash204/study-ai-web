'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Users, 
  Globe, 
  Lock, 
  Camera, 
  Sparkles,
  Loader2,
  ShieldCheck 
} from 'lucide-react';
import * as studyGroupService from '@/services/studyGroupService';

export default function CreateGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
    rules: '', // New field
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setLoading(true);
      // 1. Create the group
      const newGroup = await studyGroupService.createStudyGroup(formData.name, {
        description: formData.description,
        isPublic: formData.isPublic,
        rules: formData.rules, // Passing rules
      });

      // 2. Upload avatar if selected
      if (avatarFile) {
        await studyGroupService.uploadAvatar(newGroup.id, avatarFile);
      }

      router.push(`/study-groups/${newGroup.id}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Không thể tạo nhóm học tập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFA] p-4 md:p-8 pt-20">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors mb-8 font-black text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} />
          Quay lại
        </button>

        <div className="bg-white rounded-[40px] border-2 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-8 md:p-12 border-b border-gray-50 bg-gradient-to-r from-indigo-50 to-purple-50">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                   <Sparkles size={18} className="text-indigo-600" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tạo cộng đồng học tập</h1>
             </div>
             <p className="text-gray-500 font-bold mb-0">Xây dựng không gian để cùng nhau tiến bộ và chia sẻ kiến thức.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <div className="relative group/avatar">
                <div className="w-28 h-28 rounded-[36px] bg-gray-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Users size={40} className="text-gray-300" />
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer rounded-[36px]">
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <Camera size={24} className="text-white" />
                </label>
              </div>
              <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ảnh đại diện nhóm</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Tên nhóm</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Team Ôn thi Học sinh giỏi Toán 12"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Mô tả (Không bắt buộc)</label>
                <textarea
                  placeholder="Mục tiêu của nhóm, các chủ đề sẽ thảo luận..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 min-h-[100px] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1 flex items-center gap-2">
                   <ShieldCheck size={14} className="text-indigo-600" />
                   Nội quy nhóm (Không bắt buộc)
                </label>
                <textarea
                  placeholder="1. Tôn trọng lẫn nhau&#10;2. Không share link spam&#10;3. Tập trung học tập..."
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300 min-h-[120px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPublic: true })}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      formData.isPublic 
                        ? 'border-indigo-600 bg-indigo-50/50' 
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                 >
                    <div className={`p-2 rounded-lg ${formData.isPublic ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                       <Globe size={18} />
                    </div>
                    <div className="text-left">
                       <p className={`text-sm font-black ${formData.isPublic ? 'text-indigo-600' : 'text-gray-900'}`}>Công khai</p>
                       <p className="text-[10px] font-bold text-gray-400">Ai cũng có thể tìm thấy</p>
                    </div>
                 </button>

                 <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPublic: false })}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      !formData.isPublic 
                        ? 'border-gray-900 bg-gray-50' 
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                 >
                    <div className={`p-2 rounded-lg ${!formData.isPublic ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                       <Lock size={18} />
                    </div>
                    <div className="text-left">
                       <p className={`text-sm font-black ${!formData.isPublic ? 'text-gray-900' : 'text-gray-900'}`}>Riêng tư</p>
                       <p className="text-[10px] font-bold text-gray-400">Cần mã mời để tham gia</p>
                    </div>
                 </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Đang thiết lập...
                </>
              ) : (
                'Tạo cộng đồng ngay'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
