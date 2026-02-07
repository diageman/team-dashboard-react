import { clsx, type ClassValue } from 'clsx';

/**
 * Утилита для объединения классов (для Magic UI компонентов)
 */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

/**
 * Конвертирует секунды в формат H:MM:SS
 */
export const secondsToTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Конвертирует время в формате H:MM:SS или MM:SS в секунды
 */
export const timeToSeconds = (timeStr: string): number => {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const parts = timeStr.split(':').map(p => parseInt(p) || 0);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }
    return 0;
};
