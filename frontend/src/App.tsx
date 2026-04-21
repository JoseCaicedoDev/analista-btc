import React from 'react';
import {
  Layers
} from 'lucide-react';

import { useMarketStore } from './store/useMarketStore';
import { useMarketData } from './hooks/useMarketData';
import { useStrategyScanner } from './hooks/useStrategyScanner';
import { AssetSelector } from './components/AssetSelector';
import { PriceCard } from './components/PriceCard';
import { AlertPanel } from './components/AlertPanel';
import { RSIChart } from './components/RSIChart';
import { MACDChart } from './components/MACDChart';
import { StochRSIChart } from './components/StochRSIChart';


const App: React.FC = () => {
  const { history4h, historyDaily, historyWeekly } = useMarketStore();
  const [countdown, setCountdown] = React.useState(5);

  // Use custom hooks for side effects
  useMarketData();
  useStrategyScanner();

  // Countdown cycles 5→0 in sync with the 5s indicator refresh interval
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 5 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  return (
    <div className="h-screen bg-slate-950 text-slate-100 font-sans p-4 flex flex-col overflow-hidden">
      {/* Header - Fixed Height */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 glass-panel p-4 glow-indigo shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <Layers size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none mb-1 text-white">
              Vigía <span className="text-indigo-400">Estratégico</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono tracking-wider uppercase">Multi-Timeframe Engine</span>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Next Refresh</span>
            <span className="text-sm font-black font-mono text-indigo-400 w-[12px]">{countdown}s</span>
          </div>
          <AssetSelector />
        </div>
      </header>

      {/* Main Content Area - Expandable */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">

        {/* Sidebar - Fixed/Scrollable Column */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
          <div className="shrink-0"><PriceCard /></div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <AlertPanel />
          </div>
        </div>

        {/* Charts Section - Flexible Heights - HIDDEN ON MOBILE */}
        <div className="hidden lg:flex lg:col-span-9 flex-col gap-4 min-h-0">




          {/* Indicators Row - Expanded to prevent overlap */}
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
            {[
              { label: '4 HORAS', rsi: history4h.slice(-100), macd: history4h.slice(-100) },
              { label: 'DIARIO', rsi: historyDaily.slice(-100), macd: historyDaily.slice(-100) },
              { label: 'SEMANAL', rsi: historyWeekly.slice(-100), macd: historyWeekly.slice(-100) },
            ].map((timeframe, idx) => (
              <div key={idx} className="flex flex-col gap-3 min-h-0">
                <div className="flex-1 min-h-0">
                  <StochRSIChart data={timeframe.rsi} title={`STOCH RSI ${timeframe.label}`} />
                </div>
                <div className="flex-1 min-h-0">
                  <RSIChart data={timeframe.rsi} title={`RSI ${timeframe.label}`} />
                </div>
                <div className="flex-1 min-h-0">
                  <MACDChart data={timeframe.macd} title={`MACD ${timeframe.label}`} positiveColor="#6366f1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="shrink-0 mt-3 text-center text-slate-700 text-[8px] font-mono tracking-[0.4em] uppercase">
        VIGÍA ESTRATÉGICO • REAL-TIME FEED • PWA
      </footer>
    </div>

  );
};

export default App;
