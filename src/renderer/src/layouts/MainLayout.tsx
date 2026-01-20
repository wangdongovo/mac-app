import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { PanelLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen bg-gray-50 text-gray-900 font-sans overflow-hidden drag">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <motion.div 
          initial={false}
          animate={{ paddingLeft: !isSidebarOpen ? "6rem" : "1rem" }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 40 
          }}
          className="h-12 flex items-center px-4 no-drag"
        >
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn(
                "p-2 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors cursor-pointer",
                !isSidebarOpen && ""
              )}
            >
              <PanelLeft className="w-5 h-5" />
            </button>
        </motion.div>
        
        <main className="flex-1 overflow-hidden relative p-2 pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
