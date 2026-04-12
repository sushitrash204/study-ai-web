import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';

interface SubjectCardProps {
    name: string;
    className?: string; // Tên lớp (Ví dụ: Lớp 10)
    color?: string;
    onClick?: () => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ name, className, color = '#6366f1', onClick }) => {
    return (
        <div
            onClick={onClick}
            className="group relative h-40 rounded-[28px] overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] bg-white border border-white/40 shadow-sm"
        >
            {/* Glossy Vibrant Background */}
            <div 
                className="absolute inset-0 opacity-100 transition-all duration-700 group-hover:scale-110" 
                style={{
                    background: `linear-gradient(135deg, ${color} 0%, ${color}ee 100%)`,
                }} 
            />

            {/* Glossy Overlay (Light Streak) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-[-100%] group-hover:translate-x-[100%] transform-gpu"></div>

            {/* Crystal Glow Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-60"></div>

            {/* Content Container */}
            <div className="relative h-full p-5 flex flex-col justify-between text-white z-10">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <div className="bg-white/25 backdrop-blur-xl p-2 rounded-xl border border-white/40 shadow-lg group-hover:rotate-[10deg] transition-all duration-500 w-fit">
                            <BookOpen size={18} strokeWidth={2.5} />
                        </div>
                        {className && (
                            <div className="mt-1 px-2 py-0.5 bg-black/10 backdrop-blur-lg rounded-full w-fit border border-white/10">
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/90">
                                    {className}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Môn học</p>
                    <h3 className="text-xl font-black leading-tight tracking-tight drop-shadow-md group-hover:scale-[1.02] transition-transform origin-left">{name}</h3>
                    
                    <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
                        <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-white/20">
                            Khám phá ngay
                            <ArrowRight size={12} strokeWidth={3} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Glass Watermark - More Subtle */}
            <div className="absolute -bottom-6 -right-6 opacity-10 transform -rotate-12 group-hover:rotate-0 transition-all duration-700 pointer-events-none">
                <BookOpen size={120} strokeWidth={1.5} className="text-white" />
            </div>
        </div>
    );
};

export default SubjectCard;
