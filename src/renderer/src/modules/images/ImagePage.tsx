import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '../../components/Card';
import {
    Upload, ImageIcon, Download, Trash2,
    RefreshCw, Settings2, FileImage, CheckCircle2,
    ChevronRight, ArrowRightLeft, Database
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useImageProcessor, ProcessedImage } from './useImageProcessor';

const FORMATS = ['webp', 'png'] as const;

export const ImagePage = () => {
    const [images, setImages] = useState<ProcessedImage[]>([]);
    const [quality, setQuality] = useState(80);
    const [targetFormat, setTargetFormat] = useState<'webp' | 'png'>('webp');
    const [cacheSize, setCacheSize] = useState(0);
    const { processImage, isProcessing } = useImageProcessor();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateCacheSize = async () => {
        try {
            // @ts-ignore
            const size = await window.electronAPI.image.getCacheSize();
            setCacheSize(size);
        } catch (error) {
            console.error('Failed to get cache size', error);
        }
    };

    useEffect(() => {
        updateCacheSize();
    }, []);

    const handleFiles = useCallback(async (files: File[]) => {
        const imageFiles = files.filter(f => f.type.startsWith('image/'));

        for (const file of imageFiles) {
            try {
                const result = await processImage(file, targetFormat, quality);
                setImages(prev => [result, ...prev]);

                // Save to cache
                // @ts-ignore
                await window.electronAPI.image.saveToCache({
                    fileName: `${result.id}_${result.name.split('.')[0]}.${targetFormat}`,
                    dataUrl: result.compressedUrl
                });
                updateCacheSize();
            } catch (error) {
                console.error('Processing failed', error);
            }
        }
    }, [processImage, targetFormat, quality]);

    const onDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    }, [handleFiles]);

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(Array.from(e.target.files));
            // Reset value to allow selecting the same file again
            e.target.value = '';
        }
    };

    const handleClearCache = async () => {
        // @ts-ignore
        await window.electronAPI.image.clearCache();
        updateCacheSize();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const downloadImage = (img: ProcessedImage) => {
        const link = document.createElement('a');
        link.href = img.compressedUrl;
        link.download = `compressed_${img.name.split('.')[0]}.${img.format}`;
        link.click();
    };

    const removeImage = (id: string) => {
        setImages(prev => prev.filter(img => img.id !== id));
    };

    return (
        <div className="flex flex-col h-full space-y-4 p-4 overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">图片工具</h1>
                    <p className="text-sm text-gray-500">转换格式、压缩体积并管理缓存</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 px-2 border-r border-gray-100">
                        <Database className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-medium text-gray-600">缓存: {formatFileSize(cacheSize)}</span>
                    </div>
                    <button
                        onClick={handleClearCache}
                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        title="清除缓存"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Settings Panel */}
                <Card className="lg:col-span-1 p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
                            <Settings2 className="w-5 h-5 text-blue-500" />
                            <span>转换设置</span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">目标格式</label>
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                {FORMATS.map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setTargetFormat(f)}
                                        className={cn(
                                            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                                            targetFormat === f ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                        )}
                                    >
                                        {f.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">压缩质量</label>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{quality}%</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={quality}
                                onChange={(e) => setQuality(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                    </div>

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={onDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="group relative border-2 border-dashed border-gray-200 rounded-2xl p-8 transition-all hover:border-blue-400 hover:bg-blue-50/30 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer"
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            multiple
                            accept="image/png, image/jpeg, image/webp"
                            onChange={onFileSelect}
                        />
                        <div className="p-4 bg-gray-50 rounded-full group-hover:bg-blue-100 transition-colors">
                            <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700">点击或拖拽图片到这里</p>
                            <p className="text-xs text-gray-500 mt-1">支持 JPG, PNG, WEBP</p>
                        </div>
                    </div>
                </Card>

                {/* Results Panel */}
                <div className="lg:col-span-2 space-y-4">
                    <AnimatePresence>
                        {images.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 space-y-4 bg-white/50 border border-dashed border-gray-200 rounded-3xl"
                            >
                                <FileImage className="w-12 h-12 opacity-20" />
                                <p>暂无处理记录</p>
                            </motion.div>
                        ) : (
                            images.map((img) => (
                                <motion.div
                                    key={img.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    layout
                                >
                                    <Card className="p-4 group hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                                                <img src={img.compressedUrl} alt={img.name} className="w-full h-full object-cover" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate mb-1">{img.name}</h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-gray-400 line-through">{formatFileSize(img.originalSize)}</span>
                                                    <ChevronRight className="w-3 h-3 text-gray-300" />
                                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                        {formatFileSize(img.compressedSize)}
                                                    </span>
                                                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                                        {img.format}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => downloadImage(img)}
                                                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors"
                                                    title="保存"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => removeImage(img.id)}
                                                    className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                                                    title="删除"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
