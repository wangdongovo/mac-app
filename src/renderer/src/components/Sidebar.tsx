import { useState } from 'react';
import { 
  LayoutGrid, Activity, Network, FileText, 
  Globe, List, Package, 
  Layers, Sliders, 
  GitGraph, Send, 
  Info, Settings,
  User, PanelLeft
} from 'lucide-react';
import { cn } from '../lib/utils';

const SidebarItem = ({ icon: Icon, label, active = false, collapsed = false }: { icon: any, label: string, active?: boolean, collapsed?: boolean }) => (
  <div className={cn(
    "flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors",
    active ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
    collapsed && "justify-center px-2"
  )}
  title={collapsed ? label : undefined}
  >
    <Icon className="w-4 h-4" />
    {!collapsed && <span className="whitespace-nowrap">{label}</span>}
  </div>
);

const SidebarSection = ({ title, children, collapsed }: { title?: string, children: React.ReactNode, collapsed?: boolean }) => (
  <div className="mb-4">
    {title && !collapsed && <div className="px-4 py-2 text-xs font-semibold text-gray-400">{title}</div>}
    {title && collapsed && <div className="h-4"></div>} 
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "bg-gray-50 h-full flex flex-col p-2 select-none transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="flex-1 no-scrollbar no-drag bg-white p-2 rounded-2xl flex flex-col">
        {/* Header with Traffic Lights placeholder and Toggle Button */}
        <div className="h-10 flex items-center justify-end px-2 mb-2 relative">
             <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors no-drag"
             >
                <PanelLeft className="w-4 h-4" />
             </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <SidebarSection collapsed={isCollapsed}>
            <SidebarItem icon={LayoutGrid} label="概览" active collapsed={isCollapsed} />
            <SidebarItem icon={Activity} label="流量" collapsed={isCollapsed} />
            <SidebarItem icon={Network} label="连接" collapsed={isCollapsed} />
            <SidebarItem icon={FileText} label="日志" collapsed={isCollapsed} />
          </SidebarSection>

          <SidebarSection title="代理" collapsed={isCollapsed}>
            <SidebarItem icon={Globe} label="代理" collapsed={isCollapsed} />
            <SidebarItem icon={List} label="规则" collapsed={isCollapsed} />
            <SidebarItem icon={Package} label="资源" collapsed={isCollapsed} />
          </SidebarSection>

          <SidebarSection title="设置" collapsed={isCollapsed}>
            <SidebarItem icon={Layers} label="配置" collapsed={isCollapsed} />
            <SidebarItem icon={Sliders} label="高级" collapsed={isCollapsed} />
          </SidebarSection>

          <SidebarSection title="实验" collapsed={isCollapsed}>
            <SidebarItem icon={GitGraph} label="拓扑" collapsed={isCollapsed} />
            <SidebarItem icon={Send} label="航线" collapsed={isCollapsed} />
          </SidebarSection>
        </div>
      </div>

      
    </div>
  );
}
