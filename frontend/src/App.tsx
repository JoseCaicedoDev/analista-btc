import React from 'react';
import { useMarketData } from './hooks/useMarketData';
import { useStrategyScanner } from './hooks/useStrategyScanner';
import { useMarketStore } from './store/useMarketStore';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { PriceMonitor } from './components/dashboard/PriceMonitor';
import { StatusMatrix } from './components/dashboard/StatusMatrix';
import { HistoryPanel } from './components/dashboard/HistoryPanel';
import { AnalyticsMatrix } from './components/dashboard/AnalyticsMatrix';
import { ETFMatrix } from './components/dashboard/ETFMatrix';
import { LayoutDashboard, Wallet } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'analytics' | 'etfs'>('analytics');
  const { fetchEtfs } = useMarketStore();

  // Global Side Effects for data fetching and strategy scanning
  useMarketData();
  useStrategyScanner();

  React.useEffect(() => {
    fetchEtfs();
  }, [fetchEtfs]);

  return (
    <DashboardLayout
      sidebar={
        <div className="flex flex-col h-full gap-4 min-h-0">
          <div className="flex bg-[#08090a] border border-[#1f2937] p-1 rounded-xl mb-2">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${
                activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <LayoutDashboard size={14} />
              ANALYSIS
            </button>
            <button
              onClick={() => setActiveTab('etfs')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${
                activeTab === 'etfs' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Wallet size={14} />
              ETFs
            </button>
          </div>
          <PriceMonitor />
          <StatusMatrix />
          <HistoryPanel />
        </div>
      }
      main={activeTab === 'analytics' ? <AnalyticsMatrix /> : <ETFMatrix />}
    />
  );
};

export default App;
