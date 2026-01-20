

import { LayoutGrid } from 'lucide-react';

export function OverviewPage() {
  return (
    <div className="p-6 h-full overflow-y-auto no-scrollbar no-drag">
      <div className="flex items-center gap-2 mb-6">
        <LayoutGrid className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-800">设备概览</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 col-span-full">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">系统状态</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">运行时间</div>
                <div className="text-xl font-bold text-gray-900">2天 4小时</div>
             </div>
             <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">CPU 使用率</div>
                <div className="text-xl font-bold text-gray-900">12%</div>
             </div>
             <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">内存使用</div>
                <div className="text-xl font-bold text-gray-900">4.2 GB</div>
             </div>
             <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">网络状态</div>
                <div className="text-xl font-bold text-green-500">在线</div>
             </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">快捷操作</h2>
          <div className="space-y-3">
             <button className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm text-left">
               更新订阅
             </button>
             <button className="w-full py-2 px-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm text-left">
               清除缓存
             </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">今日流量</h2>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold text-gray-900">1.2</span>
            <span className="text-gray-500 mb-1">GB</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <div className="text-xs text-gray-400">总限额: 100 GB</div>
        </div>
      </div>
    </div>
  )
}
