'use client';

import React from 'react';
import { Bot, User as UserIcon } from 'lucide-react';
import MathView from '../common/MathView';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ChatMessageProps {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ text, sender }) => {
    const isUser = sender === 'user';

    return (
        <div 
            className={cn(
                "flex group animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out mb-6",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            <div className={cn(
                "flex max-w-[85%] md:max-w-[90%]",
                isUser ? "flex-row-reverse" : "flex-row"
            )}>
                {/* Avatar */}
                <div className={cn(
                    "flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                    isUser 
                        ? "ml-3 bg-[#E5E7EB] text-[#4B5563]" 
                        : "mr-3 bg-[#8B5CF6] text-white shadow-md shadow-[#8B5CF6]/20"
                )}>
                    {isUser ? <UserIcon size={18} strokeWidth={2.5} /> : <Bot size={22} strokeWidth={1.5} />}
                </div>

                {/* Bubble Container */}
                <div className={cn(
                    "flex flex-col",
                    isUser ? "items-end" : "items-start"
                )}>
                    {/* Label/Name */}
                    <span className={cn(
                        "text-[10px] font-black tracking-widest uppercase mb-1.5 px-1",
                        isUser ? "text-[#9CA3AF]" : "text-[#8B5CF6]"
                    )}>
                        {isUser ? 'Bạn' : 'AI Assistant'}
                    </span>

                    {/* Bubble */}
                    <div className={cn(
                        "relative p-4 md:p-5 rounded-[24px] text-sm md:text-[15px] leading-relaxed shadow-sm transition-all duration-300",
                        isUser
                            ? "bg-[#8B5CF6] text-white rounded-tr-sm group-hover:shadow-[#8B5CF6]/20 group-hover:shadow-lg"
                            : "bg-white text-[#1F2937] border border-[#E5E7EB] rounded-tl-sm group-hover:shadow-lg group-hover:shadow-black/5"
                    )}>
                        <MathView 
                            content={text} 
                            isUser={isUser}
                            className={cn(
                                isUser ? "text-white" : "text-[#374151]"
                            )} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ChatMessage);
