import React, { useState, useMemo } from 'react';
import { Card } from '../../components/Card';
import { 
  Search, Plus, 
  Copy, Calendar, CheckCircle2, Circle, Check, Pencil, Trash2, ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface ClipboardItem {
  id: string;
  name: string;
  content: string;
  tag: string;
  status: 'Active' | 'Archived';
  createdAt: string;
}

const MOCK_DATA: ClipboardItem[] = [
  { id: '1', name: 'API Key Production', content: 'sk-prod-1234567890abcdef', tag: 'Secrets', status: 'Active', createdAt: '2023-10-01' },
  { id: '2', name: 'Meeting Notes Template', content: '# Meeting Notes\nDate:\nAttendees:', tag: 'Templates', status: 'Active', createdAt: '2023-10-05' },
  { id: '3', name: 'SQL Connect String', content: 'postgres://user:pass@localhost:5432/db', tag: 'Dev', status: 'Active', createdAt: '2023-10-12' },
  { id: '4', name: 'Signature HTML', content: '<div>Best regards,<br>John Doe</div>', tag: 'Personal', status: 'Archived', createdAt: '2023-10-15' },
];

const TAG_COLORS: Record<string, string> = {
  'Secrets': 'bg-red-100 text-red-700 border-red-200',
  'Templates': 'bg-blue-100 text-blue-700 border-blue-200',
  'Dev': 'bg-purple-100 text-purple-700 border-purple-200',
  'Personal': 'bg-green-100 text-green-700 border-green-200',
  'default': 'bg-gray-100 text-gray-700 border-gray-200'
};

export function ClipboardPage() {
  const [items, setItems] = useState<ClipboardItem[]>(MOCK_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Archived'>('All');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ClipboardItem | null>(null);
  
  // New Item State
  const [newItemName, setNewItemName] = useState('');
  const [newItemContent, setNewItemContent] = useState('');
  const [newItemTag, setNewItemTag] = useState('General');

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set(items.map(i => i.tag));
    return ['All', ...Array.from(tags)];
  }, [items]);

  const filteredItems = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(lowerQuery) || 
        item.tag.toLowerCase().includes(lowerQuery) ||
        item.content.toLowerCase().includes(lowerQuery);
      
      const matchesTab = activeTab === 'All' || item.tag === activeTab;
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      
      return matchesSearch && matchesTab && matchesStatus;
    });
  }, [items, searchQuery, activeTab, statusFilter]);

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setTimeout(() => {
      setEditingItem(null);
      setNewItemName('');
      setNewItemContent('');
      setNewItemTag('General');
    }, 200);
  };

  const handleSave = () => {
    if (!newItemName || !newItemContent) return;
    
    if (editingItem) {
      setItems(items.map(item => item.id === editingItem.id ? {
        ...item,
        name: newItemName,
        content: newItemContent,
        tag: newItemTag
      } : item));
    } else {
      const newItem: ClipboardItem = {
        id: Date.now().toString(),
        name: newItemName,
        content: newItemContent,
        tag: newItemTag || 'General',
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setItems([newItem, ...items]);
    }
    
    handleCloseModal();
  };

  const handleEdit = (item: ClipboardItem) => {
    setEditingItem(item);
    setNewItemName(item.name);
    setNewItemContent(item.content);
    setNewItemTag(item.tag);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="h-full flex flex-col gap-4 p-2 overflow-hidden">
      {/* Header & Actions */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            
          </div>
          
          <div className="flex items-center gap-3">
            {/* Status Filter Dropdown */}
            <div className="relative no-drag">
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 hover:border-gray-300 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <span>
                  {statusFilter === 'All' ? '全部状态' :
                   statusFilter === 'Active' ? '活跃' : '归档'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              <AnimatePresence>
                {isStatusDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsStatusDropdownOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 top-full mt-2 w-32 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20 overflow-hidden"
                    >
                      {['All', 'Active', 'Archived'].map(status => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status as any);
                            setIsStatusDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-between transition-colors"
                        >
                          <span>{status === 'All' ? '全部状态' : status === 'Active' ? '活跃' : '归档'}</span>
                          {statusFilter === status && <Check className="w-3 h-3 text-blue-500" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="relative group no-drag">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="搜索名称或标签..." 
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-gray-900/10 active:scale-95 no-drag"
            >
              <Plus className="w-4 h-4" />
              新增记录
            </button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <Card className="flex-1 overflow-hidden flex flex-col shadow-sm border-gray-200" noPadding>
        {/* Table Header */}
        <div className="w-full flex items-center bg-gray-50/50 border-b border-gray-100 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider gap-2">
          <div className="flex-1 min-w-0">名称 / 内容</div>
          <div className="w-24 flex-none">标签</div>
          <div className="w-20 flex-none">状态</div>
          <div className="w-28 flex-none">创建时间</div>
          <div className="w-20 flex-none text-center">操作</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
             
              <p>未找到记录</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={item.id}
                className={cn(
                  "w-full flex items-center border-b border-gray-50 hover:bg-gray-50/80 transition-colors group px-4 py-3 text-sm gap-2"
                )}
              >
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="font-medium text-gray-900 truncate">{item.name}</div>
                  <div className="text-xs text-gray-500 truncate mt-0.5 max-w-[90%]">{item.content}</div>
                </div>

                <div className="w-24 flex-none flex items-center">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium border truncate max-w-full",
                    TAG_COLORS[item.tag] || TAG_COLORS['default']
                  )}>
                    {item.tag}
                  </span>
                </div>

                <div className="w-20 flex-none flex items-center">
                  <div className="flex items-center gap-1.5 truncate w-full">
                    {item.status === 'Active' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={cn(
                      "text-xs font-medium truncate",
                      item.status === 'Active' ? "text-gray-700" : "text-gray-500"
                    )}>{item.status}</span>
                  </div>
                </div>

                <div className="w-28 flex-none text-gray-500 text-xs flex items-center gap-1">
                   <Calendar className="w-3 h-3 flex-shrink-0" />
                   <span className="truncate">{item.createdAt}</span>
                </div>

                <div className="w-20 flex-none flex justify-center items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity no-drag">
                  <button 
                    onClick={() => handleCopy(item.content, item.id)}
                    className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                    title="Copy Content"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
        
        {/* Pagination Footer (Visual Only) */}
        <div className="border-t border-gray-100 p-3 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
           <div>共 {items.length} 条</div>
           <div className="flex items-center gap-2">
             <span>每页显示</span>
             <select className="bg-transparent border border-gray-200 rounded p-1 text-xs no-drag">
               <option>10</option>
               <option>20</option>
               <option>50</option>
             </select>
             <div className="flex items-center gap-1 ml-4">
                <button className="px-2 py-1 hover:bg-gray-200 rounded disabled:opacity-50 no-drag" disabled>上一页</button>
                <span>第 1 页 / 共 1 页</span>
                <button className="px-2 py-1 hover:bg-gray-200 rounded disabled:opacity-50 no-drag" disabled>下一页</button>
             </div>
           </div>
        </div>
      </Card>

      {/* Add Item Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-[400px] z-10 p-6 flex flex-col gap-4 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">{editingItem ? '编辑剪贴板记录' : '新增剪贴板记录'}</h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">名称</label>
                  <input 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="例如：生产环境 API Key"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">内容</label>
                  <textarea 
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[100px] resize-none"
                    placeholder="在此粘贴内容..."
                    value={newItemContent}
                    onChange={(e) => setNewItemContent(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">标签</label>
                  <div className="flex flex-wrap gap-2">
                    {['General', 'Secrets', 'Templates', 'Dev', 'Personal'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setNewItemTag(tag)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                          newItemTag === tag 
                            ? "bg-gray-900 text-white border-gray-900 shadow-md" 
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button 
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!newItemName || !newItemContent}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-all shadow-lg shadow-gray-900/10 disabled:opacity-50 disabled:shadow-none"
                >
                  {editingItem ? '保存' : '创建'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
