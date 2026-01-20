import { 
  LayoutGrid, Activity, Network, FileText, 
  Globe, List, Package, 
  Layers, Sliders, 
  GitGraph, Send, 
  Info, Settings,
  User
} from 'lucide-react';
import { cn } from '../lib/utils';

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <div className={cn(
    "flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors",
    active ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
  )}>
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </div>
);

const SidebarSection = ({ title, children }: { title?: string, children: React.ReactNode }) => (
  <div className="mb-4">
    {title && <div className="px-4 py-2 text-xs font-semibold text-gray-400">{title}</div>}
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

export function Sidebar() {
  return (
    <div className="w-64 bg-gray-50 h-full flex flex-col border-r border-gray-200 p-4 select-none">
      {/* Window Controls */}
      <div className="flex gap-2 mb-8 px-2">
        
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar no-drag">
        <SidebarSection>
          <SidebarItem icon={LayoutGrid} label="概览" active />
          <SidebarItem icon={Activity} label="流量" />
          <SidebarItem icon={Network} label="连接" />
          <SidebarItem icon={FileText} label="日志" />
        </SidebarSection>

        <SidebarSection title="代理">
          <SidebarItem icon={Globe} label="代理" />
          <SidebarItem icon={List} label="规则" />
          <SidebarItem icon={Package} label="资源" />
        </SidebarSection>

        <SidebarSection title="设置">
          <SidebarItem icon={Layers} label="配置" />
          <SidebarItem icon={Sliders} label="高级" />
        </SidebarSection>

        <SidebarSection title="实验">
          <SidebarItem icon={GitGraph} label="拓扑" />
          <SidebarItem icon={Send} label="航线" />
        </SidebarSection>
      </div>

      {/* Bottom Profile Section */}
      <div className="mt-auto pt-4 relative">
        {/* Cat Mascot Placeholder */}
        <div className="absolute -top-12 right-4 text-4xl">
           🐱
        </div>

        {/* User Card */}
        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-3 mb-4 flex items-center gap-3 shadow-sm no-drag">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow-sm">
            jzb
          </div>
          <div className="overflow-hidden">
            <div className="font-bold text-gray-800 text-sm">jzb</div>
            <div className="text-xs text-gray-500 truncate">#CM-343919 · 新手航员</div>
          </div>
        </div>

        <div className="space-y-1">
          <SidebarItem icon={Info} label="关于" />
          <SidebarItem icon={Settings} label="设置" />
        </div>
      </div>
    </div>
  );
}
