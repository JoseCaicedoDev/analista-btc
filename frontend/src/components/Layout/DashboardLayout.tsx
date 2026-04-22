import React from 'react';
import { FluidHeader } from '../shared/FluidHeader';

interface DashboardLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ sidebar, main }) => {
  return (
    <div className="flex flex-col h-screen bg-black text-gray-200 overflow-hidden font-sans">
      <FluidHeader />
      
      <main className="flex-1 overflow-hidden p-4 md:p-6">
        <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          
          {/* Sidebar Column: Price & Alerts */}
          <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
            {sidebar}
          </div>

          {/* Main Analytics Column: Charts */}
          <div className="hidden lg:flex lg:col-span-9 flex-col gap-6 min-h-0 overflow-hidden">
            {main}
          </div>
          
        </div>
      </main>
    </div>
  );
};
