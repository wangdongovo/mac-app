import { useState, useCallback } from 'react';

export interface ProcessedImage {
    id: string;
    name: string;
    originalSize: number;
    compressedSize: number;
    originalUrl: string;
    compressedUrl: string;
    format: 'png' | 'webp';
    quality: number;
    status: 'processing' | 'done' | 'error';
}

export const useImageProcessor = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    const processImage = useCallback(async (
        file: File,
        format: 'png' | 'webp',
        quality: number
    ): Promise<ProcessedImage> => {
        setIsProcessing(true);
        const id = Math.random().toString(36).substr(2, 9);
        const originalUrl = URL.createObjectURL(file);

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0);

                const mimeType = format === 'webp' ? 'image/webp' : 'image/png';
                const compressedUrl = canvas.toDataURL(mimeType, quality / 100);

                // Calculate size from data URL
                const base64Length = compressedUrl.split(',')[1].length;
                const compressedSize = Math.floor(base64Length * 0.75);

                setIsProcessing(false);
                resolve({
                    id,
                    name: file.name,
                    originalSize: file.size,
                    compressedSize,
                    originalUrl,
                    compressedUrl,
                    format,
                    quality,
                    status: 'done'
                });
            };
            img.onerror = () => {
                setIsProcessing(false);
                reject(new Error('Failed to load image'));
            };
            img.src = originalUrl;
        });
    }, []);

    return {
        processImage,
        isProcessing
    };
};
