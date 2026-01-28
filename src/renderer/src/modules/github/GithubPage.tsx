import React, { useState, useCallback, useRef } from 'react';
import { Card } from '../../components/Card';
import {
    Github, Upload, Copy,
    Trash2, Settings2, CheckCircle2, CloudUpload,
    Globe, ExternalLink, ShieldCheck, Database,
    ChevronLeft, ChevronRight, Calendar, Search, X,
    MoreHorizontal
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openConfig = () => {
        setTempConfig({
            ...config,
            path: config.path || 'images'
        });
        setShowConfig(true);
        setTestResult(null);
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const totalPages = Math.ceil(history.length / pageSize);
    const pagedHistory = history.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Reset page to 1 if history length changes or current page is out of bounds
    React.useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (totalPages === 0) {
            setCurrentPage(1);
        }
    }, [history.length, totalPages, currentPage]);

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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
        setErrorMsg(null);

        for (const file of files) {
            try {
                await uploadToGithub(file);
            } catch (error: any) {
                setErrorMsg(`上传失败: ${error.message}. 请检查 Token、Owner 和 Repo 是否正确。`);
                setShowConfig(true);
                break;
            }
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="flex flex-col h-full bg-background text-foreground font-sans no-drag">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-8 no-scrollbar">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Github className="w-8 h-8" />
                            <span>Github 图床</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">上传图片至 Github 并通过 jsDelivr CDN 加速访问</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={clearHistory}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-destructive h-9 px-4 py-2 border border-input bg-background"
                            title="清除历史"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            <span>清空历史</span>
                        </button>
                        <button
                            onClick={openConfig}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 shadow"
                        >
                            <Settings2 className="w-4 h-4 mr-2" />
                            <span>配置仓库</span>
                        </button>
                    </div>
                </div>

                {/* Upload & Stats Container */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Stats/Info Cards */}
                    <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
                        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col gap-1">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-xs font-medium uppercase tracking-wider">当前仓库</span>
                                <Database className="w-4 h-4" />
                            </div>
                            <div className="mt-1">
                                <p className="text-sm font-semibold truncate" title={`${config.owner}/${config.repo}`}>
                                    {config.owner ? `${config.owner}/${config.repo}` : '未配置'}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                    <span>Branch: {config.branch || 'main'}</span>
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col gap-1">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span className="text-xs font-medium uppercase tracking-wider">CDN 加速</span>
                                <Globe className="w-4 h-4" />
                            </div>
                            <div className="mt-1">
                                <p className="text-sm font-semibold">jsDelivr</p>
                                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-secondary-foreground mt-1 uppercase">
                                    Active
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dropzone */}
                    <div className="lg:col-span-3 order-1 lg:order-2">
                        <div
                            onDrop={onDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={triggerFileInput}
                            className={cn(
                                "relative w-full h-[240px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group",
                                isUploading ? "bg-muted border-primary" : "border-border hover:border-primary hover:bg-muted/50"
                            )}
                        >
                            <input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                multiple
                                accept="image/*"
                            />

                            <div className={cn(
                                "p-5 rounded-full bg-secondary transition-all",
                                !isUploading && "group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground"
                            )}>
                                {isUploading ? (
                                    <div className="w-10 h-10 border-4 border-muted-foreground/20 border-t-primary rounded-full animate-spin" />
                                ) : (
                                    <CloudUpload className="w-10 h-10" />
                                )}
                            </div>

                            <div className="text-center">
                                <p className="text-lg font-semibold">{isUploading ? '正在极速上传...' : '点击或拖拽图片'}</p>
                                <p className="text-sm text-muted-foreground">支持 PNG, JPG, GIF, WebP (Max 5MB)</p>
                            </div>

                            {/* Decorative dots for shadcn feel */}
                            <div className="absolute top-4 left-4 grid grid-cols-2 gap-1 opacity-20">
                                {[...Array(4)].map((_, i) => <div key={i} className="w-1 h-1 bg-foreground rounded-full" />)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Banner */}
                <AnimatePresence>
                    {errorMsg && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-3 text-destructive text-sm font-medium">
                                <Trash2 className="w-4 h-4 shrink-0" />
                                <span className="flex-1">{errorMsg}</span>
                                <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-destructive/20 rounded-md transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* History Table - Responsive Adaptation */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold tracking-tight uppercase">备份历史</h3>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                                {history.length}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                        {/* PC Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-muted-foreground">预览</th>
                                        <th className="px-6 py-4 font-semibold text-muted-foreground">名称</th>
                                        <th className="px-6 py-4 font-semibold text-muted-foreground">CDN 链接</th>
                                        <th className="px-6 py-4 font-semibold text-muted-foreground">时间</th>
                                        <th className="px-6 py-4 font-semibold text-muted-foreground text-right">管理</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {history.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3 opacity-20">
                                                    <Search className="w-12 h-12" />
                                                    <p className="font-semibold">暂无数据</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        pagedHistory.map((item) => (
                                            <tr key={item.id} className="hover:bg-muted/30 transition-colors group/row">
                                                <td className="px-6 py-4">
                                                    <div className="w-12 h-12 rounded-lg bg-muted border overflow-hidden">
                                                        <img src={item.url} alt={item.name} className="w-full h-full object-cover transition-transform group-hover/row:scale-110" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-middle">
                                                    <p className="font-bold truncate max-w-[180px]" title={item.name}>{item.name}</p>
                                                </td>
                                                <td className="px-6 py-4 align-middle">
                                                    <div className="flex items-center gap-2">
                                                        <code className="px-2 py-1 bg-muted rounded text-[11px] font-mono max-w-[200px] truncate">
                                                            {item.cdnUrl}
                                                        </code>
                                                        <button
                                                            onClick={() => copyToClipboard(item.cdnUrl, item.id)}
                                                            className={cn(
                                                                "p-1.5 rounded-md transition-all border",
                                                                copiedId === item.id
                                                                    ? "bg-primary text-primary-foreground border-primary"
                                                                    : "bg-background hover:bg-muted border-input"
                                                            )}
                                                        >
                                                            {copiedId === item.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 align-middle text-muted-foreground whitespace-nowrap">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 align-middle text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                        <a href={item.cdnUrl} target="_blank" rel="noreferrer" className="p-2 hover:bg-muted rounded-md border border-transparent hover:border-border transition-all">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                        <button onClick={() => removeFromHistory(item.id)} className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-md transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile List View (Adaptation) */}
                        <div className="lg:hidden divide-y divide-border">
                            {history.length === 0 ? (
                                <div className="p-12 text-center opacity-20">
                                    <Search className="w-10 h-10 mx-auto mb-2" />
                                    <p className="text-sm font-semibold">暂无数据</p>
                                </div>
                            ) : (
                                pagedHistory.map((item) => (
                                    <div key={item.id} className="p-4 flex gap-4">
                                        <div className="w-16 h-16 shrink-0 rounded-lg border bg-muted overflow-hidden">
                                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <p className="font-bold text-sm truncate">{item.name}</p>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <button
                                                    onClick={() => copyToClipboard(item.cdnUrl, item.id)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border border-input bg-background hover:bg-muted"
                                                >
                                                    {copiedId === item.id ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                    <span>{copiedId === item.id ? 'Copied' : 'Copy link'}</span>
                                                </button>
                                                <div className="flex gap-2">
                                                    <a href={item.cdnUrl} target="_blank" rel="noreferrer" className="p-1.5 text-muted-foreground">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                    <button onClick={() => removeFromHistory(item.id)} className="p-1.5 text-muted-foreground">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-md border border-input bg-background hover:bg-muted disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-md border border-input bg-background hover:bg-muted disabled:opacity-50 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Config Modal */}
            <AnimatePresence>
                {showConfig && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowConfig(false)}
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 10 }}
                            className="relative w-full max-w-lg"
                        >
                            <div className="bg-card border rounded-xl shadow-lg flex flex-col p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                            <Settings2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold tracking-tight">Github 配置</h2>
                                            <p className="text-xs text-muted-foreground">配置仓库以同步所有图片</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowConfig(false)}
                                        className="p-2 hover:bg-muted rounded-md transition-colors opacity-70 hover:opacity-100"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 ml-1">
                                            <ShieldCheck className="w-3.5 h-3.5" /> Token (Required)
                                        </label>
                                        <input
                                            type="password"
                                            value={tempConfig.token}
                                            onChange={e => setTempConfig({ ...tempConfig, token: e.target.value })}
                                            placeholder="ghp_************************"
                                            className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Owner</label>
                                            <input
                                                value={tempConfig.owner}
                                                onChange={e => setTempConfig({ ...tempConfig, owner: e.target.value })}
                                                placeholder="e.g. wangdong"
                                                className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Repo Name</label>
                                            <input
                                                value={tempConfig.repo}
                                                onChange={e => setTempConfig({ ...tempConfig, repo: e.target.value })}
                                                placeholder="e.g. image-host"
                                                className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Branch</label>
                                            <input
                                                value={tempConfig.branch}
                                                onChange={e => setTempConfig({ ...tempConfig, branch: e.target.value })}
                                                placeholder="main"
                                                className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Path</label>
                                            <input
                                                value={tempConfig.path || ''}
                                                onChange={e => setTempConfig({ ...tempConfig, path: e.target.value })}
                                                placeholder="e.g. uploads"
                                                className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleTestConnection}
                                        disabled={isTesting}
                                        className={cn(
                                            "flex-1 h-11 rounded-lg text-sm font-bold border transition-all",
                                            testResult === 'success' ? "bg-green-500/10 border-green-500 text-green-600" :
                                                testResult === 'error' ? "bg-destructive/10 border-destructive text-destructive" :
                                                    "bg-background border-input hover:bg-muted"
                                        )}
                                    >
                                        {isTesting ? 'Testing...' : testResult === 'success' ? 'Connected' : 'Test Connection'}
                                    </button>
                                    <button
                                        onClick={handleSaveConfig}
                                        className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-bold shadow-sm transition-all active:scale-[0.98]"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
