import React from 'react';
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react';

interface SubjectCardProps {
    name: string;
    className?: string; // Tên lớp (Ví dụ: Lớp 10)
    color?: string;
    onClick?: () => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ name, className, color = '#6366f1', onClick }) => {
    // Tạo gradient từ màu chủ đạo
    const gradientStyle = {
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
    };

    return (
        <div
            onClick={onClick}
            className="group relative h-44 rounded-[28px] overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] bg-white border border-gray-100"
        >
            {/* Background Content */}
            <div 
                className="absolute inset-0 opacity-100 transition-all duration-500 group-hover:scale-110" 
                style={gradientStyle} 
            />

            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

            {/* Content Container */}
            <div className="relative h-full p-6 flex flex-col justify-between text-white z-10">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-2xl border border-white/30 shadow-inner group-hover:rotate-[15deg] transition-transform duration-500 w-fit">
                            <BookOpen size={20} strokeWidth={2.5} />
                        </div>
                        {className && (
                            <span className="mt-2 px-2 py-0.5 bg-black/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-wider border border-white/10">
                                {className}
                            </span>
                        )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                        <Sparkles size={16} className="text-white/80" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Chương trình học</p>
                    <h3 className="text-xl font-black leading-tight tracking-tight drop-shadow-sm group-hover:scale-[1.02] transition-transform origin-left">{name}</h3>
                    
                    <div className="flex items-center gap-1.5 pt-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                        <span className="text-[11px] font-black uppercase tracking-wider">Khám phá ngay</span>
                        <ArrowRight size={14} strokeWidth={3} />
                    </div>
                </div>
            </div>

            {/* Decorative Watermark */}
            <div className="absolute -bottom-6 -right-6 opacity-10 transform -rotate-12 group-hover:rotate-0 transition-all duration-700 pointer-events-none">
                <BookOpen size={120} strokeWidth={1} />
            </div>

            {/* Bottom Glow Effect */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
    );
};

export default SubjectCard;
