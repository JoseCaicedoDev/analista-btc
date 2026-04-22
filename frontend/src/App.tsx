import React from 'react';
import { useMarketData } from './hooks/useMarketData';
import { useStrategyScanner } from './hooks/useStrategyScanner';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { PriceMonitor } from './components/dashboard/PriceMonitor';
import { StatusMatrix } from './components/dashboard/StatusMatrix';
import { HistoryPanel } from './components/dashboard/HistoryPanel';
import { AnalyticsMatrix } from './components/dashboard/AnalyticsMatrix';

const App: React.FC = () => {
  // Global Side Effects for data fetching and strategy scanning
  useMarketData();
  useStrategyScanner();

  return (
    <DashboardLayout
      sidebar={
        <>
          <PriceMonitor />
          <StatusMatrix />
          <HistoryPanel />
        </>
      }
      main={<AnalyticsMatrix />}
    />
  );
};

export default App;
