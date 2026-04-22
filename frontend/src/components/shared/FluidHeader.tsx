import React from 'react';
import { Activity, Bell } from 'lucide-react';

export const FluidHeader: React.FC = () => {
  return (
    <header className="shrink-0 flex items-center justify-between px-6 py-4 bg-gray-950/50 backdrop-blur-md border-b border-gray-800/60 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Activity size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-black text-white tracking-tight uppercase">
            Analista <span className="text-primary-500">BTC</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full border-2 border-gray-900"></span>
        </button>
      </div>
    </header>
  );
};
