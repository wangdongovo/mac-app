import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export function MainLayout() {
  return (
    <div className="flex h-screen w-screen bg-gray-50 text-gray-900 font-sans overflow-hidden drag">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        <main className="flex-1 overflow-hidden relative p-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
