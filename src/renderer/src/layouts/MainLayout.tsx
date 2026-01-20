import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { PanelLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen bg-gray-50 text-gray-900 font-sans overflow-hidden drag">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300">
        <div className={cn(
          "h-12 flex items-center px-4 no-drag transition-all duration-300",
          !isSidebarOpen && "pl-24"
        )}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn(
                "p-2 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors cursor-pointer",
                !isSidebarOpen && "bg-gray-200"
              )}
            >
              <PanelLeft className="w-5 h-5" />
            </button>
        </div>
        
        <main className="flex-1 overflow-hidden relative p-2 pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
