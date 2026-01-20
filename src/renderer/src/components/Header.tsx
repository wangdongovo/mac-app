import { Bell, Shield, Globe, Quote, ChevronDown } from 'lucide-react';

export function Header() {
  return (
    <div className="h-16 flex items-center justify-between px-8 bg-transparent">
      <h1 className="text-xl font-bold text-gray-800">ClashMac 面板</h1>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
          <span className="text-sm font-medium text-gray-700">Travel</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>

        <div className="bg-gray-100 p-1 rounded-lg flex items-center text-xs font-medium text-gray-600">
          <div className="px-3 py-1 hover:bg-white hover:shadow-sm rounded-md cursor-pointer transition-all">直连</div>
          <div className="px-3 py-1 hover:bg-white hover:shadow-sm rounded-md cursor-pointer transition-all">规则</div>
          <div className="px-3 py-1 bg-white shadow-sm rounded-md text-gray-900 cursor-pointer">全局</div>
        </div>

        <div className="flex items-center gap-2">
           <button className="p-2 text-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
             <Globe className="w-5 h-5" />
           </button>
           <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
             <Shield className="w-5 h-5" />
           </button>
           <button className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
             <Quote className="w-5 h-5" />
           </button>
        </div>
      </div>
    </div>
  );
}
