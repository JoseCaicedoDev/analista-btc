import React from 'react';
import { 
  Zap,
  Layers,
  BarChart3
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Cell
} from 'recharts';

import { useMarketStore } from './store/useMarketStore';
import { useMarketData, useAlerts } from './hooks/useMarketData';
import { AssetSelector } from './components/AssetSelector';
import { PriceCard } from './components/PriceCard';
import { AlertPanel } from './components/AlertPanel';
import { RSIChart } from './components/RSIChart';
import { MACDChart } from './components/MACDChart';

const App: React.FC = () => {
  const { history4h, historyDaily, historyWeekly, currentPrice } = useMarketStore();
  const [countdown, setCountdown] = React.useState(5);
  
  // Use custom hooks for side effects
  useMarketData();
  useAlerts();

  // Countdown logic - resets when currentPrice changes
  React.useEffect(() => {
    setCountdown(5);
  }, [currentPrice]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 5));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getRSIColor = (val?: number) => {
    if (!val) return 'text-blue-400';
    if (val > 70) return 'text-red-400';
    if (val < 30) return 'text-green-400';
    return 'text-blue-400';
  };

  const lastRSI4h = history4h[history4h.length - 1]?.rsi;
  const lastRSID = historyDaily[historyDaily.length - 1]?.rsi;
  const lastRSIW = historyWeekly[historyWeekly.length - 1]?.rsi;

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
              CryptoAnalyzer <span className="text-indigo-400">ULTRA</span>
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

          <div className="glass-panel p-5 shrink-0">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-4 flex items-center gap-2 tracking-[0.2em]">
              <Zap size={12} className="text-yellow-500" /> Resumen Fuerza
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '4H', val: lastRSI4h },
                    { label: 'D', val: lastRSID },
                    { label: 'W', val: lastRSIW }
                  ].map((item, idx) => (
                    <div key={idx} className="text-center p-2 bg-slate-950/50 rounded-lg border border-slate-800/50">
                      <p className="text-[8px] text-slate-500 mb-0.5 font-bold uppercase">{item.label}</p>
                      <p className={`text-xs font-black ${getRSIColor(item.val)}`}>
                        {item.val ? item.val.toFixed(1) : '--'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                {[
                  { label: '4 Horas', data: history4h },
                  { label: 'Diario', data: historyDaily },
                  { label: 'Semanal', data: historyWeekly }
                ].map((item, idx) => {
                  const lastHist = item.data[item.data.length - 1]?.hist ?? 0;
                  return (
                    <div key={idx} className="flex justify-between items-center bg-slate-950/30 px-3 py-1.5 rounded-lg border border-slate-800/50">
                      <span className="text-[10px] font-medium text-slate-400">{item.label}</span>
                      <span className={`text-[9px] font-black tracking-widest ${lastHist >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {lastHist >= 0 ? 'ALCISTA' : 'BAJISTA'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <AlertPanel />
          </div>
        </div>

        {/* Charts Section - Flexible Heights */}
        <div className="lg:col-span-9 flex flex-col gap-4 min-h-0">
          
          {/* Main Chart 4H - Real Candlestick Chart */}
          <div className="glass-panel p-5 h-[42%] shrink-0 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                <BarChart3 size={12} className="text-indigo-500" /> Movimiento Principal 4H (VELAS)
              </h3>
              <div className="flex items-center gap-4 text-[9px] font-bold">
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> ALCISTA</div>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> BAJISTA</div>
              </div>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={history4h.slice(-100)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.2} />
                  <XAxis dataKey="time" hide />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    orientation="right" 
                    stroke="#475569" 
                    fontSize={8} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => val.toLocaleString()}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111218', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }} 
                    labelFormatter={(t) => new Date(t).toLocaleString()}
                  />
                  
                  {/* Candle Wick (Low to High) */}
                  <Bar dataKey={(d) => [d.low ?? d.price, d.high ?? d.price]} barSize={1} isAnimationActive={false}>
                    {history4h.slice(-100).map((entry, index) => (
                      <Cell key={`wick-${index}`} fill={(entry.close ?? 0) >= (entry.open ?? 0) ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                  
                  {/* Candle Body (Open to Close) */}
                  <Bar dataKey={(d) => [d.open ?? d.price, d.close ?? d.price]} barSize={8} isAnimationActive={false}>
                    {history4h.slice(-100).map((entry, index) => (
                      <Cell key={`body-${index}`} fill={(entry.close ?? 0) >= (entry.open ?? 0) ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>



          {/* Indicators Row - Expanded to prevent overlap */}
          <div className="flex-1 min-h-0 grid grid-cols-3 gap-4">
            {[
              { label: '4 HORAS', rsi: history4h.slice(-100), macd: history4h.slice(-100) },
              { label: 'DIARIO', rsi: historyDaily.slice(-100), macd: historyDaily.slice(-100) },
              { label: 'SEMANAL', rsi: historyWeekly.slice(-100), macd: historyWeekly.slice(-100) },
            ].map((timeframe, idx) => (
              <div key={idx} className="flex flex-col gap-3 min-h-0">
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
        NO-SCROLL DASHBOARD • REAL-TIME FEED • PWA ULTRA
      </footer>
    </div>

  );
};

export default App;
