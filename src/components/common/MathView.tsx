'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface MathViewProps {
    content: string;
    isUser?: boolean;
    inline?: boolean;
    className?: string;
}

export default function MathView({ content, isUser = false, inline = false, className }: MathViewProps) {
    if (!content) return null;

    return (
        <div className={cn(
            "prose prose-sm max-w-none break-words",
            isUser ? "text-white" : "text-[#1F2937]",
            inline ? "inline-block" : "block",
            className
        )}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    p: ({ children }) => <span className={inline ? "" : "block mb-1 last:mb-0"}>{children}</span>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
