'use client';

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Eye, EyeOff, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface AudioPlayerProps {
    script: string;
    lang?: string;
    showScript?: boolean;
    canShowScript?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ script, lang = 'en', showScript: initialShowScript = false, canShowScript = true }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showScript, setShowScript] = useState(initialShowScript);
    const [isLoading, setIsLoading] = useState(false);

    // Cleanup speech when component unmounts
    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const togglePlay = () => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            alert("Trình duyệt của bạn không hỗ trợ phát âm thanh này.");
            return;
        }

        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            return;
        }

        setIsLoading(true);
        window.speechSynthesis.cancel(); // Clear any pending speech

        const utterance = new SpeechSynthesisUtterance(script);
        utterance.lang = lang;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            setIsPlaying(true);
            setIsLoading(false);
        };

        utterance.onend = () => {
            setIsPlaying(false);
        };

        utterance.onerror = (e) => {
            console.error("Web Speech API Error:", e);
            setIsPlaying(false);
            setIsLoading(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="w-full max-w-xl group/audio">
            <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm border-2 border-[#E2E8F0] p-2 pr-4 rounded-2xl shadow-sm transition-all hover:border-[#8B5CF6]/30 hover:shadow-md">
                <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-sm",
                        isPlaying ? "bg-[#8B5CF6] text-white" : "bg-[#F5F3FF] text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white"
                    )}
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : isPlaying ? (
                        <RotateCcw size={22} strokeWidth={2.5} />
                    ) : (
                        <Play size={22} fill="currentColor" />
                    )}
                </button>

                <div className="flex-1 px-2">
                    <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                        {isPlaying && (
                            <div className="h-full bg-[#8B5CF6] animate-[progress_linear_infinite]" 
                                 style={{ animationDuration: `${script.length * 0.15}s` }} />
                        )}
                    </div>
                </div>

                {canShowScript && (
                    <button
                        onClick={() => setShowScript(!showScript)}
                        className="p-2 text-[#64748B] hover:bg-white rounded-xl transition-all"
                    >
                        {showScript ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>

            {showScript && (
                <div className="mt-2 p-3 bg-white border border-dashed border-[#CBD5E1] rounded-xl animate-in slide-in-from-top-1 duration-200">
                    <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Transcript:</p>
                    <p className="text-[13px] text-[#475569] leading-relaxed italic font-serif">&ldquo;{script}&rdquo;</p>
                </div>
            )}

            <style jsx>{`
                @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default React.memo(AudioPlayer);
