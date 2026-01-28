import { useState, useCallback, useEffect } from 'react';

export interface GithubConfig {
    token: string;
    owner: string;
    repo: string;
    branch: string;
    path: string;
}

export interface GithubUploadResult {
    id: string;
    name: string;
    url: string;
    cdnUrl: string;
    createdAt: string;
}

const STORAGE_KEY_CONFIG = 'github_hosting_config';
const STORAGE_KEY_HISTORY = 'github_hosting_history';

export const useGithubUpload = () => {
    const [config, setConfig] = useState<GithubConfig>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
        return saved ? JSON.parse(saved) : { token: '', owner: '', repo: '', branch: 'main', path: 'images' };
    });

    const [history, setHistory] = useState<GithubUploadResult[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
        return saved ? JSON.parse(saved) : [];
    });

    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    }, [config]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    }, [history]);

    const saveConfig = (newConfig: GithubConfig) => setConfig(newConfig);

    const uploadToGithub = useCallback(async (file: File): Promise<GithubUploadResult> => {
        if (!config.token || !config.owner || !config.repo) {
            throw new Error('Github 配置不完整');
        }

        setIsUploading(true);
        try {
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
                reader.onload = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve(base64);
                };
                reader.readAsDataURL(file);
            });

            const content = await base64Promise;
            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

            // Normalize path: remove leading/trailing slashes
            const cleanPath = config.path.replace(/^\/+|\/+$/g, '');
            const filePath = cleanPath ? `${cleanPath}/${fileName}` : fileName;

            const response = await fetch(
                `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${config.token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: `Upload image ${fileName} via Mac App`,
                        content: content,
                        branch: config.branch
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '上传失败');
            }

            const data = await response.json();
            const rawUrl = data.content.download_url;
            // jsdelivr format: https://cdn.jsdelivr.net/gh/owner/repo@branch/path
            const cdnUrl = `https://cdn.jsdelivr.net/gh/${config.owner}/${config.repo}@${config.branch}/${filePath}`;

            const result: GithubUploadResult = {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                url: rawUrl,
                cdnUrl: cdnUrl,
                createdAt: new Date().toISOString()
            };

            setHistory(prev => [result, ...prev]);
            return result;
        } finally {
            setIsUploading(false);
        }
    }, [config]);

    const clearHistory = () => setHistory([]);
    const removeFromHistory = (id: string) => setHistory(prev => prev.filter(item => item.id !== id));

    return {
        config,
        saveConfig,
        history,
        uploadToGithub,
        isUploading,
        clearHistory,
        removeFromHistory,
        testConnection: async (cfg: GithubConfig) => {
            const response = await fetch(
                `https://api.github.com/repos/${cfg.owner}/${cfg.repo}`,
                {
                    headers: {
                        'Authorization': `token ${cfg.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '连接失败');
            }
            return true;
        }
    };
};
