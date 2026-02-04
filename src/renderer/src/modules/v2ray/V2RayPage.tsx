import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { V2RayNode, V2RaySubscription } from './types';
import { Wifi, WifiOff, Activity, Trash2, Plus, Play, Square, RefreshCw, X, Clipboard, Edit2, Share2, Zap, Download, Globe } from 'lucide-react';

export const V2RayPage = () => {
    const [nodes, setNodes] = useState<V2RayNode[]>([]);
    const [subscriptions, setSubscriptions] = useState<V2RaySubscription[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [connectedNodeId, setConnectedNodeId] = useState<string | null>(null);
    const [newNode, setNewNode] = useState<Partial<V2RayNode>>({});
    const [newSub, setNewSub] = useState<Partial<V2RaySubscription>>({});
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [subLoadingId, setSubLoadingId] = useState<string | null>(null);

    useEffect(() => {
        checkStatus();
        // Load nodes and subscriptions from local storage
        const savedNodes = localStorage.getItem('v2ray_nodes');
        if (savedNodes) {
            try {
                const parsed = JSON.parse(savedNodes);
                const migrated = Array.isArray(parsed) ? parsed.map((n: any) => ({
                    protocol: n.protocol || 'vmess',
                    ...n
                })) : [];
                setNodes(migrated);
            } catch {
                setNodes(JSON.parse(savedNodes));
            }
        }
        const savedSubs = localStorage.getItem('v2ray_subscriptions');
        if (savedSubs) {
            setSubscriptions(JSON.parse(savedSubs));
        }
    }, []);

    useEffect(() => {
        if (nodes.length > 0) {
             // Only auto-schedule ping if we have nodes and haven't pinged yet (or just rely on manual mostly, 
             // but user wants it displayed. We'll do a one-time ping after load if latency is missing)
             const hasMissingLatency = nodes.some(n => n.latency === undefined);
             if (hasMissingLatency) {
                 handlePingAll();
             }
        }
    }, [nodes.length]); // Re-check when node count changes (e.g. init load)

    const checkStatus = async () => {
        try {
            const status = await (window as any).electronAPI.v2ray.status();
            setIsConnected(status);
        } catch (e) {
            console.error("Failed to check status", e);
        }
    };

    const safeBase64Decode = (input: string) => {
        try {
            let s = input.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
            const pad = s.length % 4;
            if (pad === 2) s += '==';
            else if (pad === 3) s += '=';
            return decodeURIComponent(escape(atob(s)));
        } catch (e) {
            console.error('Base64 decode failed', e);
            return '';
        }
    };

    const parseShadowsocksLink = (link: string): V2RayNode | null => {
        try {
            // Re-implementing simplified SS parsing because URL object fails on some SS links
             const raw = link.replace('ss://', '');
             const hashIndex = raw.indexOf('#');
             const tag = hashIndex !== -1 ? decodeURIComponent(raw.substring(hashIndex + 1)) : 'Shadowsocks Node';
             const main = hashIndex !== -1 ? raw.substring(0, hashIndex) : raw;

             let decoded = main;
             if (!main.includes('@')) {
                 decoded = safeBase64Decode(main);
             }

             let method = '', password = '', host = '', port = 0, name = '';

             if (decoded.includes('@')) {
                 const [userInfo, address] = decoded.split('@');
                 const [methodStr, passwordStr] = userInfo.split(':');
                 const [hostStr, portStr] = address.split(':');
                 
                 method = methodStr;
                 password = passwordStr;
                 host = hostStr;
                 port = Number(portStr);
                 name = tag;
             } else {
                 return null;
             }

            return {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                protocol: 'shadowsocks',
                name: name || 'Shadowsocks',
                address: host,
                port: port,
                uuid: password, // Store password in uuid field for uniformity
                alterId: 0,
                security: method, // Store method in security field
                network: 'tcp',
                path: '',
                host: '',
                tls: '',
            };
        } catch (e) {
            console.error('Failed to parse ss link', link, e);
            return null;
        }
    };

    const parseTrojanLink = (link: string): V2RayNode | null => {
        try {
            const url = new URL(link);
            const password = url.username;
            const address = url.hostname;
            const port = Number(url.port || 443);
            const name = decodeURIComponent((url.hash || '').replace(/^#/, '')) || 'Trojan Node';
            const query = url.searchParams;
            const sni = query.get('sni') || '';
            const type = query.get('type') || 'tcp';
            const security = query.get('security') || 'tls';

            return {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                protocol: 'trojan',
                name,
                address,
                port,
                uuid: password, // Password in uuid
                alterId: 0,
                security: security,
                network: type,
                path: '',
                host: sni,
                tls: 'tls', // Trojan is usually TLS
            };
        } catch (e) {
             console.error('Failed to parse trojan link', link, e);
             return null;
        }
    };

    const parseVlessLink = (link: string): V2RayNode | null => {
        try {
            const url = new URL(link);
            const uuid = url.username;
            const address = url.hostname;
            const port = Number(url.port || 443);
            const q = url.searchParams;
            const name = decodeURIComponent((url.hash || '').replace(/^#/, '')) || 'Unnamed Node';
            const network = q.get('type') || 'tcp';
            const path = q.get('path') || '';
            const host = q.get('host') || q.get('sni') || '';
            const tls = (q.get('security') || '') === 'tls' ? 'tls' : '';

            return {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                protocol: 'vless',
                name,
                address,
                port,
                uuid,
                alterId: 0,
                security: 'auto',
                network,
                path,
                host,
                tls,
            };
        } catch (e) {
            console.error('Failed to parse vless link', link, e);
            return null;
        }
    };

    const fetchSubscriptionNodes = async (url: string): Promise<V2RayNode[]> => {
        try {
            const content = await (window as any).electronAPI.v2ray.fetchSubscription(url);
            if (!content) throw new Error('Empty response');

            let text = content.trim();
            let links: string[] = [];

            // Try to decode base64
            try {
                const decoded = safeBase64Decode(text);
                links = decoded.split(/[\r\n\s]+/).filter((l: string) => l.startsWith('vmess://') || l.startsWith('vless://'));
            } catch (e) {
                // If not base64, check if it's just a list of links
                 links = text.split(/[\r\n\s]+/).filter((l: string) => l.startsWith('vmess://') || l.startsWith('vless://'));
            }

            if (links.length === 0) {
                 throw new Error('No valid nodes found');
            }

            const parsedNodes: V2RayNode[] = [];
            for (const link of links) {
                try {
                    if (link.startsWith('vmess://')) {
                        const base64 = link.replace('vmess://', '');
                        const decoded = safeBase64Decode(base64);
                        const config = JSON.parse(decoded);
                        parsedNodes.push({
                            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                            protocol: 'vmess',
                            name: config.ps || 'Unnamed Node',
                            address: config.add,
                            port: Number(config.port),
                            uuid: config.id,
                            alterId: Number(config.aid || 0),
                            security: config.scy || 'auto',
                            network: config.net || 'ws',
                            path: config.path || '',
                            host: config.host || '',
                            tls: config.tls || '',
                        });
                    } else if (link.startsWith('vless://')) {
                        const node = parseVlessLink(link);
                        if (node) parsedNodes.push(node);
                    } else if (link.startsWith('ss://')) {
                        const node = parseShadowsocksLink(link);
                        if (node) parsedNodes.push(node);
                    } else if (link.startsWith('trojan://')) {
                         const node = parseTrojanLink(link);
                         if (node) parsedNodes.push(node);
                    }
                } catch (e) {
                    console.error('Failed to parse link', link, e);
                }
            }
            return parsedNodes;
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const handleAddSubscription = async () => {
        if (!newSub.url || !newSub.name) {
            setError('Please enter both Name and URL');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const nodesFromSub = await fetchSubscriptionNodes(newSub.url);
            const subscriptionId = Date.now().toString();
            
            const newSubscription: V2RaySubscription = {
                id: subscriptionId,
                name: newSub.name!,
                url: newSub.url!,
                updatedAt: Date.now(),
            };

            // Assign subscriptionId to nodes
            const nodesWithId = nodesFromSub.map(n => ({ ...n, subscriptionId }));

            const updatedSubs = [...subscriptions, newSubscription];
            const updatedNodes = [...nodes, ...nodesWithId];

            setSubscriptions(updatedSubs);
            setNodes(updatedNodes);
            
            localStorage.setItem('v2ray_subscriptions', JSON.stringify(updatedSubs));
            localStorage.setItem('v2ray_nodes', JSON.stringify(updatedNodes));
            
            setIsSubModalOpen(false);
            setNewSub({});
            
            // Ping new nodes
             setTimeout(() => handlePingAll(), 500);

        } catch (e: any) {
            setError(e.message || 'Failed to add subscription');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateSubscription = async (sub: V2RaySubscription) => {
        setSubLoadingId(sub.id);
        try {
            const nodesFromSub = await fetchSubscriptionNodes(sub.url);
            
            // Remove old nodes for this subscription
            const otherNodes = nodes.filter(n => n.subscriptionId !== sub.id);
            
            // Add new nodes
            const nodesWithId = nodesFromSub.map(n => ({ ...n, subscriptionId: sub.id }));
            
            const updatedNodes = [...otherNodes, ...nodesWithId];
            
            // Update subscription timestamp
            const updatedSubs = subscriptions.map(s => 
                s.id === sub.id ? { ...s, updatedAt: Date.now() } : s
            );

            setNodes(updatedNodes);
            setSubscriptions(updatedSubs);
            
            localStorage.setItem('v2ray_subscriptions', JSON.stringify(updatedSubs));
            localStorage.setItem('v2ray_nodes', JSON.stringify(updatedNodes));

             setTimeout(() => handlePingAll(), 500);

        } catch (e: any) {
            alert('Failed to update subscription: ' + e.message);
        } finally {
            setSubLoadingId(null);
        }
    };

    const handleDeleteSubscription = (id: string) => {
        if (!confirm('Are you sure you want to delete this subscription and all its nodes?')) return;
        
        const updatedSubs = subscriptions.filter(s => s.id !== id);
        const updatedNodes = nodes.filter(n => n.subscriptionId !== id);
        
        setSubscriptions(updatedSubs);
        setNodes(updatedNodes);
        
        localStorage.setItem('v2ray_subscriptions', JSON.stringify(updatedSubs));
        localStorage.setItem('v2ray_nodes', JSON.stringify(updatedNodes));
    };

    const handleImportClipboard = async () => {
        setIsLoading(true);
        try {
            let text = await navigator.clipboard.readText();
            if (!text) {
                setIsLoading(false);
                return;
            }
            text = text.trim();

            // Handle Subscription URL
            if (text.startsWith('http://') || text.startsWith('https://')) {
                try {
                    const content = await (window as any).electronAPI.v2ray.fetchSubscription(text);
                    if (content) {
                        text = content.trim();
                    }
                } catch (e: any) {
                    console.error('Failed to fetch subscription', e);
                    alert('Failed to fetch subscription: ' + (e.message || 'Unknown error'));
                    setIsLoading(false);
                    return;
                }
            }

            // Simple parsing for now - support single or newline separated
            let links = text.split(/[\r\n\s]+/).filter(l => l.startsWith('vmess://') || l.startsWith('vless://') || l.startsWith('ss://') || l.startsWith('trojan://'));
            
            if (links.length === 0) {
                // Try to decode base64 in case it's a subscription body
                try {
                    // Handle URL-safe base64 and whitespace
                    const decoded = safeBase64Decode(text);
                    links = decoded.split(/[\r\n\s]+/).filter(l => l.startsWith('vmess://') || l.startsWith('vless://') || l.startsWith('ss://') || l.startsWith('trojan://'));
                } catch (e) {
                    // Not base64 or failed to decode
                    console.log('Failed to decode base64', e);
                }
            }

            if (links.length === 0) {
                alert('No valid links found in clipboard or subscription');
                setIsLoading(false);
                return;
            }

            const newNodes: V2RayNode[] = [];
            
            for (const link of links) {
                try {
                    if (link.startsWith('vmess://')) {
                        const base64 = link.replace('vmess://', '');
                        const decoded = safeBase64Decode(base64); // Standard VMess links use Base64
                        const config = JSON.parse(decoded);
                        const node: V2RayNode = {
                            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                            protocol: 'vmess',
                            name: config.ps || 'Unnamed Node',
                            address: config.add,
                            port: Number(config.port),
                            uuid: config.id,
                            alterId: Number(config.aid || 0),
                            security: config.scy || 'auto',
                            network: config.net || 'ws',
                            path: config.path || '',
                            host: config.host || '',
                            tls: config.tls || '',
                        };
                        newNodes.push(node);
                    } else if (link.startsWith('vless://')) {
                        const node = parseVlessLink(link);
                        if (node) newNodes.push(node);
                    }
                } catch (e) {
                    console.error('Failed to parse link', link, e);
                }
            }

            if (newNodes.length > 0) {
                const updatedNodes = [...nodes, ...newNodes];
                setNodes(updatedNodes);
                localStorage.setItem('v2ray_nodes', JSON.stringify(updatedNodes));
                
                // We'll trigger ping all after a short delay to let state update
                setTimeout(() => handlePingAll(), 500);
            } else {
                alert('Failed to parse any nodes from the content');
            }
        } catch (e) {
            console.error('Failed to read clipboard', e);
            alert('Failed to read clipboard');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNode = () => {
        setError(null);
        if (!newNode.name || !newNode.address || !newNode.port || !newNode.uuid) {
            setError('Please fill in Name, Address, Port and UUID');
            return;
        }
        
        const node: V2RayNode = {
            id: Date.now().toString(),
            protocol: (newNode as any).protocol || 'vmess',
            name: newNode.name,
            address: newNode.address,
            port: Number(newNode.port),
            uuid: newNode.uuid,
            alterId: Number(newNode.alterId) || 0,
            security: newNode.security || 'auto',
            network: newNode.network || 'ws',
            path: newNode.path,
            host: newNode.host,
            tls: newNode.tls,
        };

        const updatedNodes = [...nodes, node];
        setNodes(updatedNodes);
        localStorage.setItem('v2ray_nodes', JSON.stringify(updatedNodes));
        setIsAddModalOpen(false);
        setNewNode({});
        setError(null);
    };

    const generateUUID = () => {
        // Simple UUID v4 generator
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        setNewNode({...newNode, uuid});
    };

    const handleDeleteNode = (id: string) => {
        const updatedNodes = nodes.filter(n => n.id !== id);
        setNodes(updatedNodes);
        localStorage.setItem('v2ray_nodes', JSON.stringify(updatedNodes));
    };

    const handleConnect = async (node: V2RayNode) => {
        if (isConnected) {
            await (window as any).electronAPI.v2ray.disconnect();
        }

        let outbound: any = {};
        const commonInbounds = [{
                port: 1080,
                listen: "127.0.0.1",
                protocol: "socks",
                settings: { udp: true }
            }, {
                port: 1087,
                listen: "127.0.0.1",
                protocol: "http",
                settings: {}
            }];

        if (node.protocol === 'vless') {
             outbound = {
                protocol: "vless",
                settings: {
                    vnext: [{
                        address: node.address,
                        port: node.port,
                        users: [{
                            id: node.uuid,
                            level: 1,
                            encryption: "none"
                        }]
                    }]
                },
                streamSettings: {
                    network: node.network,
                    security: node.tls === 'tls' ? 'tls' : 'none',
                    tlsSettings: node.tls === 'tls' ? {
                        serverName: node.host || node.address,
                        allowInsecure: true
                    } : undefined,
                    wsSettings: node.network === 'ws' ? {
                        path: node.path,
                        headers: {
                            Host: node.host
                        }
                    } : undefined,
                     grpcSettings: node.network === 'grpc' ? {
                        serviceName: node.path
                    } : undefined
                }
            };
        } else if (node.protocol === 'shadowsocks') {
            outbound = {
                protocol: "shadowsocks",
                settings: {
                    servers: [{
                        address: node.address,
                        port: node.port,
                        method: node.security,
                        password: node.uuid,
                        level: 1
                    }]
                }
            };
        } else if (node.protocol === 'trojan') {
             outbound = {
                protocol: "trojan",
                settings: {
                    servers: [{
                        address: node.address,
                        port: node.port,
                        password: node.uuid,
                        level: 1
                    }]
                },
                 streamSettings: {
                    network: node.network || 'tcp',
                    security: 'tls',
                    tlsSettings: {
                        serverName: node.host || node.address,
                        allowInsecure: true
                    }
                }
            };
        } else {
            // VMess
            outbound = {
                protocol: "vmess",
                settings: {
                    vnext: [{
                        address: node.address,
                        port: node.port,
                        users: [{
                            id: node.uuid,
                            alterId: node.alterId,
                            security: node.security,
                            level: 1
                        }]
                    }]
                },
                streamSettings: {
                    network: node.network,
                    security: node.tls === 'tls' ? 'tls' : 'none',
                    tlsSettings: node.tls === 'tls' ? {
                        serverName: node.host || node.address,
                        allowInsecure: true
                    } : undefined,
                    wsSettings: node.network === 'ws' ? {
                        path: node.path,
                        headers: {
                            Host: node.host
                        }
                    } : undefined
                }
            };
        }

        const config = {
            log: { loglevel: "warning" },
            inbounds: commonInbounds,
            outbounds: [outbound, {
                protocol: "freedom",
                settings: {}
            }]
        };

        const result = await (window as any).electronAPI.v2ray.connect(config);
        if (result.success) {
            setIsConnected(true);
            setConnectedNodeId(node.id);
        } else {
            console.error(result.message);
            setError(result.message);
            alert(`Connection failed: ${result.message}`);
        }
    };

    const handleDisconnect = async () => {
        await (window as any).electronAPI.v2ray.disconnect();
        setIsConnected(false);
        setConnectedNodeId(null);
    };

    const handleLatencyTest = async (node: V2RayNode) => {
        const latency = await (window as any).electronAPI.v2ray.ping({ 
            address: node.address, 
            port: node.port 
        });
        const updatedNodes = nodes.map(n => n.id === node.id ? { ...n, latency: latency === -1 ? 9999 : latency } : n);
        setNodes(updatedNodes);
    };

    const parseVmessLink = (link: string) => {
        try {
            const base64 = link.replace('vmess://', '');
            const decoded = safeBase64Decode(base64);
            const config = JSON.parse(decoded);
            setNewNode({
                protocol: 'vmess',
                name: config.ps,
                address: config.add,
                port: Number(config.port),
                uuid: config.id,
                alterId: Number(config.aid),
                security: config.scy || 'auto',
                network: config.net || 'ws',
                path: config.path || '',
                host: config.host || '',
                tls: config.tls || '',
            });
            setError(null);
        } catch (e) {
            setError('Invalid VMess link');
        }
    };

    const handlePingAll = async () => {
        // Ping in batches of 5 to preserve resources
        const BATCH_SIZE = 5;
        const nodesToPing = [...nodes];
        const newNodes = [...nodes];
        
        // Reset valid latencies that are about to be re-tested (optional, or just update in place)
        
        for (let i = 0; i < nodesToPing.length; i += BATCH_SIZE) {
            const batch = nodesToPing.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (node) => {
                 const latency = await (window as any).electronAPI.v2ray.ping({ 
                    address: node.address, 
                    port: node.port 
                });
                // Update specific node in the full list
                const index = newNodes.findIndex(n => n.id === node.id);
                if (index !== -1) {
                    newNodes[index] = { ...newNodes[index], latency: latency === -1 ? 9999 : latency };
                }
            }));
            // Update state incrementally for better UX
            setNodes([...newNodes]);
        }
    };

    const renderNodeItem = (node: V2RayNode) => (
        <div key={node.id} className={`group flex items-center justify-between p-3 mb-2 rounded-xl border transition-all duration-200 ${connectedNodeId === node.id ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow-md'}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${connectedNodeId === node.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    {node.protocol?.toUpperCase() || 'VMESS'}
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate pr-4">{node.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                        <span className="truncate">{node.address}:{node.port}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
                {node.latency !== undefined && (
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        node.latency < 100 ? 'text-green-600 bg-green-50' : 
                        node.latency < 500 ? 'text-yellow-600 bg-yellow-50' : 
                        'text-red-600 bg-red-50'
                    }`}>
                        <Activity size={10} />
                        {node.latency === 9999 ? 'Timeout' : `${node.latency}ms`}
                    </div>
                )}

                <div className="flex items-center gap-1.5">
                    {connectedNodeId === node.id ? (
                        <button 
                            onClick={handleDisconnect}
                            className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            title="Stop"
                        >
                            <Square size={16} fill="currentColor" />
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleConnect(node)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Connect"
                        >
                            <Play size={16} fill="currentColor" />
                        </button>
                    )}
                    
                    <button
                        onClick={() => handleDeleteNode(node.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );

    const sortedNodes = useMemo(() => {
        return [...nodes].sort((a, b) => {
            // Prioritize connected node if desired, but user asked for latency sorting specifically
            // If we want connected node on top:
            // if (a.id === connectedNodeId) return -1;
            // if (b.id === connectedNodeId) return 1;

            const latA = a.latency === undefined || a.latency === 9999 ? 999999 : a.latency;
            const latB = b.latency === undefined || b.latency === 9999 ? 999999 : b.latency;
            
            if (latA !== latB) return latA - latB;
            return (a.name || '').localeCompare(b.name || '');
        });
    }, [nodes, connectedNodeId]);

    return (
        <div className="flex flex-col h-screen text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 overflow-hidden">
             {/* Header Section */}
            <div className="flex-none p-6 pb-4 pt-12 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-10">
                <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                        V2Ray Nodes
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Manage and connect to your proxy nodes</p>
                </div>
                <div className="flex gap-3">
                     <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                        {isConnected ? <Wifi size={18} /> : <WifiOff size={18} />}
                        <span className="font-medium text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                    <button 
                         onClick={handleImportClipboard}
                         disabled={isLoading}
                         className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                         title="Import from Clipboard"
                     >
                         {isLoading ? (
                             <RefreshCw size={18} className="animate-spin" />
                         ) : (
                             <Clipboard size={18} />
                         )}
                         <span className="hidden sm:inline">{isLoading ? 'Importing...' : 'Import'}</span>
                     </button>
                    <button 
                         onClick={handlePingAll}
                         className="bg-purple-50 text-purple-700 hover:bg-purple-100 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                         title="Ping All"
                     >
                         <Zap size={18} /> <span className="hidden sm:inline">Ping</span>
                     </button>
                    <button 
                        onClick={() => {
                            setIsSubModalOpen(true);
                            setError(null);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/30"
                    >
                        <Download size={18} /> <span className="hidden sm:inline">Add Sub</span>
                    </button>
                    <button 
                        onClick={() => {
                            setIsAddModalOpen(true);
                            setError(null);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/30"
                    >
                        <Plus size={18} /> <span className="hidden sm:inline">Add</span>
                    </button>
                </div>
            </div>
        </div>

             <div className="flex flex-col gap-6">
                {/* Subscriptions */}
                {subscriptions.map(sub => (
                    <div key={sub.id} className="mb-6">
                        <div className="flex items-center justify-between mb-3 px-1 sticky top-0 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur py-2 z-10">
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-gray-700 dark:text-gray-300 text-sm">{sub.name}</h2>
                                <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                                    {nodes.filter(n => n.subscriptionId === sub.id).length}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => handleUpdateSubscription(sub)}
                                    className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 transition-colors ${subLoadingId === sub.id ? 'animate-spin' : ''}`}
                                    title="Update Subscription"
                                >
                                    <RefreshCw size={14} />
                                </button>
                                <button 
                                    onClick={() => handleDeleteSubscription(sub.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                                    title="Delete Subscription"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            {sortedNodes.filter(n => n.subscriptionId === sub.id).map(renderNodeItem)}
                        </div>
                    </div>
                ))}

                {nodes.filter(n => !n.subscriptionId).length > 0 && (
                    <div className="mb-6">
                        <h2 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-3 px-1 sticky top-0 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur py-2 z-10">Manual Nodes</h2>
                        <div className="grid gap-2">
                            {sortedNodes.filter(n => !n.subscriptionId).map(renderNodeItem)}
                        </div>
                    </div>
                )}
                {nodes.length === 0 && subscriptions.length === 0 && (
                    <div className="text-center py-20 text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <div className="flex justify-center mb-4">
                            <Clipboard className="w-12 h-12 opacity-20" />
                        </div>
                        <p>No nodes available</p>
                        <button 
                            onClick={handleImportClipboard}
                            disabled={isLoading}
                            className="mt-4 text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                        >
                            {isLoading ? 'Importing...' : 'Import from Clipboard'}
                        </button>
                    </div>
                )}
            </div>

            {/* Add Subscription Modal */}
            {isSubModalOpen && createPortal(
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999]">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
                        <button 
                            onClick={() => setIsSubModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-bold mb-6">Add Subscription</h2>
                        
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <input 
                                placeholder="Subscription Name" 
                                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                value={newSub.name || ''}
                                onChange={e => setNewSub({...newSub, name: e.target.value})}
                            />
                            <input 
                                placeholder="Subscription URL" 
                                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                value={newSub.url || ''}
                                onChange={e => setNewSub({...newSub, url: e.target.value})}
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button 
                                onClick={() => setIsSubModalOpen(false)}
                                className="px-5 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleAddSubscription}
                                disabled={isLoading}
                                className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 flex items-center gap-2"
                            >
                                {isLoading && <RefreshCw size={16} className="animate-spin" />}
                                Add Subscription
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {isAddModalOpen && createPortal(
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999]">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
                        <button 
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-bold mb-6">Add V2Ray Node</h2>
                        
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                             <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Import</label>
                                <div className="flex gap-2">
                                    <input 
                                        placeholder="Paste vmess:// link here"
                                        className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
                                        onChange={(e) => parseVmessLink(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

                            <input 
                                placeholder="Name" 
                                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                value={newNode.name || ''}
                                onChange={e => setNewNode({...newNode, name: e.target.value})}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    placeholder="Address" 
                                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                    value={newNode.address || ''}
                                    onChange={e => setNewNode({...newNode, address: e.target.value})}
                                />
                                <input 
                                    placeholder="Port" 
                                    type="number"
                                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                    value={newNode.port || ''}
                                    onChange={e => setNewNode({...newNode, port: Number(e.target.value)})}
                                />
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    placeholder="UUID" 
                                    className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                    value={newNode.uuid || ''}
                                    onChange={e => setNewNode({...newNode, uuid: e.target.value})}
                                />
                                <button
                                    onClick={generateUUID}
                                    className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors tooltip"
                                    title="Generate UUID"
                                >
                                    <RefreshCw size={20} className="text-gray-600 dark:text-gray-300" />
                                </button>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <input 
                                    placeholder="AlterId (0)" 
                                    type="number"
                                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                    value={newNode.alterId || ''}
                                    onChange={e => setNewNode({...newNode, alterId: Number(e.target.value)})}
                                />
                                <input 
                                    placeholder="Security (auto)" 
                                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                    value={newNode.security || ''}
                                    onChange={e => setNewNode({...newNode, security: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    placeholder="Network (ws)" 
                                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                    value={newNode.network || ''}
                                    onChange={e => setNewNode({...newNode, network: e.target.value})}
                                />
                                <input 
                                    placeholder="Path" 
                                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                    value={newNode.path || ''}
                                    onChange={e => setNewNode({...newNode, path: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    placeholder="Host" 
                                    className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                                    value={newNode.host || ''}
                                    onChange={e => setNewNode({...newNode, host: e.target.value})}
                                />
                                <div className="flex items-center gap-2 p-3">
                                     <input 
                                        type="checkbox"
                                        id="tls-checkbox"
                                        checked={newNode.tls === 'tls'}
                                        onChange={e => setNewNode({...newNode, tls: e.target.checked ? 'tls' : ''})}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="tls-checkbox" className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable TLS</label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-5 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleAddNode}
                                className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                            >
                                Add Node
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
