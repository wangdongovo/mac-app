import { Activity } from 'lucide-react';

export function TrafficPage() {
  return (
    <div className="p-6 h-full overflow-y-auto no-scrollbar no-drag">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-800">流量详情</h1>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-gray-500">流量统计模块开发中...</p>
      </div>
    </div>
  );
}
