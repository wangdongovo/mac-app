import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutGrid, Activity, Network, FileText,
  Globe, List, Package,
  Layers, Sliders,
  GitGraph, Send,
  Info, Settings,
  ClipboardList, Image as ImageIcon, Cloud, Radio
} from 'lucide-react';
import { cn } from '../lib/utils';

const SidebarItem = ({ icon: Icon, label, path, collapsed = false }: { icon: any, label: string, path?: string, collapsed?: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = path ? location.pathname.startsWith(path) : false;

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer text-sm transition-colors",
      active ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
      collapsed && "justify-center px-2"
    )}
      title={collapsed ? label : undefined}
      onClick={() => path && navigate(path)}
    >
      <Icon className="w-4 h-4" />
      {!collapsed && <span className="whitespace-nowrap">{label}</span>}
    </div>
  );
};

const SidebarSection = ({ title, children, collapsed }: { title?: string, children: React.ReactNode, collapsed?: boolean }) => (
  <div className="mb-4">
    {title && !collapsed && <div className="px-4 py-2 text-xs font-semibold text-gray-400">{title}</div>}
    {title && collapsed && <div className="h-4"></div>}
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  return (
    <motion.div
      initial={false}
      animate={{
        width: isOpen ? "16rem" : "0rem",
        padding: isOpen ? "0.5rem" : "0rem",
        opacity: isOpen ? 1 : 0
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 40
      }}
      className="bg-gray-50 h-full flex flex-col select-none overflow-hidden"
    >
      <div className="flex-1 no-scrollbar no-drag bg-white p-2 rounded-2xl flex flex-col shadow-md min-w-[15rem]">
        <div className="h-8 drag w-full shrink-0" />
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <SidebarSection>
            <SidebarItem icon={LayoutGrid} label="概览" path="/overview" />
            <SidebarItem icon={Activity} label="流量" path="/traffic" />
            <SidebarItem icon={Network} label="连接" path="/connections" />
            <SidebarItem icon={FileText} label="日志" path="/logs" />
            <SidebarItem icon={ClipboardList} label="剪贴板" path="/clipboard" />
            <SidebarItem icon={ImageIcon} label="图片工具" path="/images" />
            <SidebarItem icon={Cloud} label="Github图床" path="/github" />
          </SidebarSection>

          <SidebarSection title="代理">
            <SidebarItem icon={Radio} label="V2Ray 节点" path="/v2ray" />
            <SidebarItem icon={Globe} label="代理" path="/proxies" />
            <SidebarItem icon={List} label="规则" path="/rules" />
            <SidebarItem icon={Package} label="资源" path="/resources" />
          </SidebarSection>

          <SidebarSection title="设置">
            <SidebarItem icon={Layers} label="配置" path="/config" />
            <SidebarItem icon={Sliders} label="高级" path="/advanced" />
          </SidebarSection>

          <SidebarSection title="实验">
            <SidebarItem icon={GitGraph} label="拓扑" path="/topology" />
            <SidebarItem icon={Send} label="航线" path="/routes" />
          </SidebarSection>
        </div>
      </div>
    </motion.div>
  );
}
