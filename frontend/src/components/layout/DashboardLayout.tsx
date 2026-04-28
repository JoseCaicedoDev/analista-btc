import React, { useState } from 'react';
import { FluidHeader } from '../shared/FluidHeader';
import { LayoutGrid, BarChart3 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ sidebar, main }) => {
  const [mobileView, setMobileView] = useState<'monitor' | 'charts'>('monitor');

  return (
    <div className="fixed inset-0 flex flex-col bg-black text-gray-200 overflow-hidden font-sans">
      <FluidHeader />
      
      <main className="flex-1 flex flex-col min-h-0 p-4 lg:p-6 overflow-hidden">
        {/* Mobile View Switcher */}
        <div className="lg:hidden flex p-1 bg-gray-900 border border-gray-800 rounded-xl mb-4 shrink-0">
          <button
            onClick={() => setMobileView('monitor')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all",
              mobileView === 'monitor' ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" : "text-gray-500"
            )}
          >
            <LayoutGrid size={14} />
            Monitor
          </button>
          <button
            onClick={() => setMobileView('charts')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all",
              mobileView === 'charts' ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" : "text-gray-500"
            )}
          >
            <BarChart3 size={14} />
            Gráficas
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
          {/* Sidebar Column: Price & Alerts */}
          <div className={cn(
            "lg:col-span-3 flex flex-col gap-6 min-h-0 overflow-hidden",
            mobileView !== 'monitor' && "hidden lg:flex"
          )}>
            {sidebar}
          </div>

          {/* Main Analytics Column: Charts */}
          <div className={cn(
            "lg:col-span-9 flex flex-col gap-6 min-h-0 overflow-hidden",
            mobileView !== 'charts' && "hidden lg:flex"
          )}>
            {main}
          </div>
        </div>
      </main>
    </div>
  );
};
