'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

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
    const [copied, setCopied] = useState(false);
    if (!content) return null;

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn(
            "prose prose-sm max-w-none break-words",
            isUser ? "prose-invert text-white !text-white" : "text-[#1F2937]",
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
                    a: ({ children, href }: any) => <a href={href} className={cn("underline transition-colors", isUser ? "text-purple-200" : "text-blue-600")} target="_blank" rel="noopener noreferrer">{children}</a>,
                    blockquote: ({ children }: { children: React.ReactNode }) => <blockquote className="border-l-4 border-gray-200 pl-4 py-1 my-2 italic text-gray-400">{children}</blockquote>,
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        
                        return !inline ? (
                            <div className="group relative my-4 rounded-xl overflow-hidden border border-[#2D2D2D] shadow-2xl">
                                <div className="flex items-center justify-between px-4 py-2 bg-[#1E1E1E] border-b border-[#2D2D2D]">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                        {match ? match[1] : 'code'}
                                    </span>
                                    <button 
                                        onClick={() => handleCopy(codeString)}
                                        className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400"
                                    >
                                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                    </button>
                                </div>
                                <SyntaxHighlighter
                                    language={match ? match[1] : 'plaintext'}
                                    style={atomDark}
                                    PreTag="div"
                                    customStyle={{
                                        margin: 0,
                                        padding: '1.25rem',
                                        backgroundColor: '#1E1E1E',
                                        fontSize: '0.8rem',
                                        lineHeight: '1.5',
                                    }}
                                >
                                    {codeString}
                                </SyntaxHighlighter>
                            </div>
                        ) : (
                            <code className={cn(
                                "px-1.5 py-0.5 rounded-md font-mono text-[0.85em] font-bold",
                                isUser ? "bg-white/20" : "bg-gray-100 text-purple-600"
                            )} {...props}>
                                {children}
                            </code>
                        );
                    },
                    table: ({ children }: { children: React.ReactNode }) => (
                        <div className="my-3 overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">{children}</table>
                        </div>
                    ),
                    thead: ({ children }: { children: React.ReactNode }) => <thead className="bg-gray-50">{children}</thead>,
                    th: ({ children }: { children: React.ReactNode }) => <th className="px-3 py-2 text-left text-[11px] font-black uppercase tracking-widest text-gray-500">{children}</th>,
                    td: ({ children }: { children: React.ReactNode }) => <td className="px-3 py-2 text-sm text-gray-600 border-t border-gray-100">{children}</td>,
                    text: ({ value }: any) => {
                        const parts = value.split(/(@[\w\d.-]+)/g);
                        return parts.map((part: string, index: number) => {
                            if (part.startsWith('@')) {
                                return (
                                    <span key={index} className={cn("font-black", isUser ? "text-white !text-white" : "text-[#8B5CF6]")}>
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
