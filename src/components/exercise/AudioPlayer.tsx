'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, Eye, EyeOff, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface AudioPlayerProps {
    script: string;
    lang?: string;
    showScript?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ script, lang = 'en', showScript: initialShowScript = false }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showScript, setShowScript] = useState(initialShowScript);
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(script.substring(0, 200))}&tl=${lang}&client=tw-ob`;

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Audio Play Error:", e));
        } else {
            setIsLoading(true);
            audioRef.current.play().then(() => {
                setIsPlaying(true);
                setIsLoading(false);
            }).catch(e => {
                console.error("Audio Play Error:", e);
                setIsPlaying(false);
                setIsLoading(false);
            });
        }
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
                            <div className="h-full bg-[#8B5CF6] animate-[progress_3s_linear_infinite]" 
                                 style={{ animationDuration: `${script.length * 0.1}s` }} />
                        )}
                    </div>
                </div>

                <button
                    onClick={() => setShowScript(!showScript)}
                    className="p-2 text-[#64748B] hover:bg-white rounded-xl transition-all"
                >
                    {showScript ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                <audio
                    ref={audioRef}
                    src={audioUrl}
                    preload="auto"
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onError={(e) => { 
                        console.error("Audio Source Error:", e);
                        setIsPlaying(false); 
                        setIsLoading(false); 
                    }}
                />
            </div>

            {showScript && (
                <div className="mt-2 p-3 bg-white border border-dashed border-[#CBD5E1] rounded-xl animate-in slide-in-from-top-1 duration-200">
                    <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Transcript:</p>
                    <p className="text-[13px] text-[#475569] leading-relaxed italic italic font-serif">"{script}"</p>
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
