import { checkIsPro } from '@/lib/shared-utils';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(input: string | number): string {
    const date = new Date(input);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export function formatDateTime(input: string | number): string {
    const date = new Date(input);
    const formattedDate = date.toLocaleDateString('en-US');
    const formattedTime = date.toLocaleTimeString('en-US', { hour12: false });
    return `${formattedDate}, ${formattedTime}`;
}

export function absoluteUrl(path: string) {
    return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

export function extractDomain(url) {
    try {
        if (url.startsWith('local-')) {
            return 'Your Knowledge Base';
        }
        const match = url.match(/^https?:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
        return match && match[1];
    } catch (error) {
        console.error('Failed to extract domain:', error, url);
        return 'memfree.me';
    }
}

export function formatBytes(
    bytes: number,
    opts: {
        decimals?: number;
        sizeType?: 'accurate' | 'normal';
    } = {},
) {
    const { decimals = 0, sizeType = 'normal' } = opts;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
        sizeType === 'accurate'
            ? accurateSizes[i] ?? 'Bytest'
            : sizes[i] ?? 'Bytes'
    }`;
}

export function getFileSizeLimit(user: any) {
    if (user && checkIsPro(user)) {
        return 20 * 1024 * 1024;
    }
    return 4 * 1024 * 1024;
}
