'use client';

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CustomAvatarProps {
    name: string;
    size?: number;
    className?: string;
    imageUrl?: string;
}

export default function CustomAvatar({ name, size = 48, className, imageUrl }: CustomAvatarProps) {
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    if (imageUrl) {
        return (
            <div 
                className={cn("rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0", className)}
                style={{ width: size, height: size }}
            >
                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
            </div>
        );
    }

    return (
        <div 
            className={cn(
                "rounded-full flex items-center justify-center bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-white font-black border-2 border-white shadow-sm shrink-0",
                className
            )}
            style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
            {initials}
        </div>
    );
}
