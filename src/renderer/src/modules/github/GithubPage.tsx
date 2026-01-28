import React, { useState, useCallback } from 'react';
import { Card } from '../../components/Card';
import {
    Github, Upload, Link as LinkIcon, Copy,
    Trash2, Settings2, CheckCircle2, CloudUpload,
    Globe, ExternalLink, ShieldCheck, Database
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useGithubUpload, GithubConfig } from './useGithubUpload';

export const GithubPage = () => {
    const {
        config, saveConfig, history, uploadToGithub,
        isUploading, clearHistory, removeFromHistory, testConnection
    } = useGithubUpload();

    const [showConfig, setShowConfig] = useState(!config.token);
    const [tempConfig, setTempConfig] = useState<GithubConfig>(config);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

    const handleSaveConfig = () => {
        saveConfig(tempConfig);
        setShowConfig(false);
        setTestResult(null);
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        setErrorMsg(null);
        try {
            await testConnection(tempConfig);
            setTestResult('success');
        } catch (error: any) {
            setTestResult('error');
            setErrorMsg(`连接测试失败: ${error.message}`);
        } finally {
            setIsTesting(false);
        }
    };

    const onDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));

        for (const file of files) {
            try {
                await uploadToGithub(file);
            } catch (error: any) {
                setErrorMsg(`上传失败: ${error.message}. 请检查 Token、Owner 和 Repo 是否正确。`);
                setShowConfig(true);
            }
        }
    }, [uploadToGithub]);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="flex flex-col h-full space-y-4 p-4 overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Github className="w-6 h-6" /> Github 图床
                    </h1>
                    <p className="text-sm text-gray-500">上传图片至 Github 仓库并获取 jsDelivr CDN 加速链接</p>
                </div>
                <div className="flex items-center gap-2">
                    {!showConfig && config.token && (
                        <div className="hidden md:flex items-center gap-3 px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Database className="w-3 h-3" /> {config.owner}/{config.repo}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            <span>{config.branch}</span>
                        </div>
                    )}
                    <button
                        onClick={clearHistory}
                        className="p-2 hover:bg-gray-100 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
                        title="清除历史"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className={cn(
                            "p-2 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium",
                            showConfig ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100 text-gray-600"
                        )}
                    >
                        <Settings2 className="w-5 h-5" />
                        <span>配置</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {showConfig && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:col-span-3 overflow-hidden"
                        >
                            <Card className="p-6 bg-blue-50/30 border-blue-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-blue-500 tracking-wider flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" /> Token
                                        </label>
                                        <input
                                            type="password"
                                            value={tempConfig.token}
                                            onChange={e => setTempConfig({ ...tempConfig, token: e.target.value })}
                                            placeholder="ghp_..."
                                            className="w-full h-9 px-3 text-sm bg-white border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">Owner</label>
                                        <input
                                            value={tempConfig.owner}
                                            onChange={e => setTempConfig({ ...tempConfig, owner: e.target.value })}
                                            placeholder="Username"
                                            className="w-full h-9 px-3 text-sm bg-white border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">Repo</label>
                                        <input
                                            value={tempConfig.repo}
                                            onChange={e => setTempConfig({ ...tempConfig, repo: e.target.value })}
                                            placeholder="Repo name"
                                            className="w-full h-9 px-3 text-sm bg-white border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">Branch</label>
                                        <input
                                            value={tempConfig.branch}
                                            onChange={e => setTempConfig({ ...tempConfig, branch: e.target.value })}
                                            placeholder="main"
                                            className="w-full h-9 px-3 text-sm bg-white border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col justify-end gap-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleTestConnection}
                                                disabled={isTesting}
                                                className={cn(
                                                    "flex-1 h-9 text-xs font-semibold rounded-lg transition-all border",
                                                    testResult === 'success' ? "bg-green-50 border-green-200 text-green-600" :
                                                        testResult === 'error' ? "bg-red-50 border-red-200 text-red-600" :
                                                            "bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
                                                )}
                                            >
                                                {isTesting ? '正在测试...' : testResult === 'success' ? '连接成功' : '测试连接'}
                                            </button>
                                            <button
                                                onClick={handleSaveConfig}
                                                className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-200 transition-colors"
                                            >
                                                保存应用
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {errorMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-3 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-600 text-sm font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="flex-1">{errorMsg}</span>
                        <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
                            <CheckCircle2 className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}

                <Card className="lg:col-span-1 p-6 flex flex-col items-center justify-center text-center space-y-6">
                    <div
                        onDrop={onDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className={cn(
                            "w-full aspect-square border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center space-y-4 transition-all cursor-pointer group",
                            isUploading ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/30"
                        )}
                    >
                        {isUploading ? (
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                                <CloudUpload className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                        ) : (
                            <div className="p-6 bg-gray-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                                <Upload className="w-10 h-10 text-gray-400 group-hover:text-blue-500" />
                            </div>
                        )}
                        <div>
                            <p className="text-base font-bold text-gray-700">{isUploading ? '正在上传...' : '拖拽图片上传'}</p>
                            <p className="text-xs text-gray-400 mt-1">支持 PNG, JPG, GIF, WebP</p>
                        </div>
                    </div>

                    <div className="w-full p-4 bg-gray-50 rounded-2xl flex items-center justify-between text-left">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-gray-100">
                                <Globe className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900">jsDelivr CDN</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Automatic Acceleration</p>
                            </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                </Card>

                <div className="lg:col-span-2 space-y-4">
                    <AnimatePresence>
                        {history.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-300 space-y-4 bg-white/50 border border-dashed border-gray-100 rounded-3xl"
                            >
                                <LinkIcon className="w-12 h-12 opacity-20" />
                                <p className="text-sm font-medium">还没有上传记录</p>
                            </motion.div>
                        ) : (
                            history.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    layout
                                >
                                    <Card className="p-4 group/item hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0">
                                                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 flex items-center gap-2 overflow-hidden">
                                                        <span className="text-[10px] text-gray-400 font-mono truncate">{item.cdnUrl}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => copyToClipboard(item.cdnUrl, item.id)}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-all flex-shrink-0",
                                                            copiedId === item.id ? "bg-green-100 text-green-600" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                        )}
                                                    >
                                                        {copiedId === item.id ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <a
                                                    href={item.cdnUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 hover:bg-gray-100 text-gray-400 hover:text-blue-500 rounded-lg transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => removeFromHistory(item.id)}
                                                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
