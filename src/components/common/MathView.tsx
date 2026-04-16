'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
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
            isUser ? "prose-invert text-white" : "text-[#1F2937]",
            inline ? "inline-block" : "block",
            className
        )}>
            <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    p: ({ children }: { children: React.ReactNode }) => <p className={cn(inline ? "inline" : "mb-2 last:mb-0 leading-relaxed")}>{children}</p>,
                    ul: ({ children }: { children: React.ReactNode }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                    ol: ({ children }: { children: React.ReactNode }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                    a: ({ children, href }: any) => <a href={href} className="text-blue-500 underline hover:text-blue-600 transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>,
                    blockquote: ({ children }: { children: React.ReactNode }) => <blockquote className="border-l-4 border-gray-200 pl-4 py-1 my-2 italic text-gray-500">{children}</blockquote>,
                    code({ node, inline, className, children, ...props }: any) {
                        return !inline ? (
                            <div className="my-2 rounded-xl bg-black/10 overflow-x-auto p-3 border border-black/5 shadow-inner">
                                <code className="text-xs font-mono" {...props}>
                                    {children}
                                </code>
                            </div>
                        ) : (
                            <code className={cn(
                                "px-1.5 py-0.5 rounded-md font-mono text-[0.85em]",
                                isUser ? "bg-white/20" : "bg-gray-100"
                            )} {...props}>
                                {children}
                            </code>
                        );
                    },
                    table: ({ children }: { children: React.ReactNode }) => (
                        <div className="my-3 overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">{children}</table>
                        </div>
                    ),
                    thead: ({ children }: { children: React.ReactNode }) => <thead className="bg-gray-50">{children}</thead>,
                    th: ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left text-[11px] font-black uppercase tracking-widest text-gray-500">{children}</th>,
                    td: ({ children }: { children: React.ReactNode }) => <td className="px-3 py-2 text-sm text-gray-600 border-t border-gray-50">{children}</td>,
                    // Mentions support
                    text: ({ value }: any) => {
                        const parts = value.split(/(@[\w\d.-]+)/g);
                        return parts.map((part: string, index: number) => {
                            if (part.startsWith('@')) {
                                return (
                                    <span key={index} className="text-indigo-600 font-bold">
                                        {part}
                                    </span>
                                );
                            }
                            return part;
                        });
                    }
                } as any}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
