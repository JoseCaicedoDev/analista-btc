import React from 'react';
import { 
  Zap,
  Layers,
  BarChart3
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

import { useMarketStore } from './store/useMarketStore';
import { useMarketData, useAlerts } from './hooks/useMarketData';
import { AssetSelector } from './components/AssetSelector';
import { PriceCard } from './components/PriceCard';
import { AlertPanel } from './components/AlertPanel';
import { RSIChart } from './components/RSIChart';
import { MACDChart } from './components/MACDChart';

const App: React.FC = () => {
  const { selectedAsset, history4h, historyDaily, historyWeekly } = useMarketStore();
  
  // Use custom hooks for side effects
  useMarketData();
  useAlerts();

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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 glass-panel p-5 glow-indigo">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <Layers size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none mb-1">
              CryptoAnalyzer <span className="text-indigo-400">ULTRA</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono tracking-wider uppercase">Multi-Timeframe Engine</span>
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </div>
        <AssetSelector />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <PriceCard />

          <div className="glass-panel p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-6 flex items-center gap-2 tracking-widest">
              <Zap size={14} className="text-yellow-500" /> Resumen Triple Fuerza
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Monitor de RSI</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '4H', val: lastRSI4h },
                    { label: 'D', val: lastRSID },
                    { label: 'W', val: lastRSIW }
                  ].map((item, idx) => (
                    <div key={idx} className="text-center p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                      <p className="text-[9px] text-slate-500 mb-1 font-bold">{item.label}</p>
                      <p className={`text-sm font-black ${getRSIColor(item.val)}`}>
                        {item.val ? item.val.toFixed(1) : '--'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Estado MACD</p>
                <div className="space-y-2">
                  {[
                    { label: '4 Horas', data: history4h },
                    { label: 'Diario', data: historyDaily },
                    { label: 'Semanal', data: historyWeekly }
                  ].map((item, idx) => {
                    const lastHist = item.data[item.data.length - 1]?.hist ?? 0;
                    return (
                      <div key={idx} className="flex justify-between items-center bg-slate-950/50 px-4 py-2.5 rounded-xl border border-slate-800/50">
                        <span className="text-[11px] font-medium text-slate-400">{item.label}</span>
                        <span className={`text-[10px] font-black tracking-widest ${lastHist >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {lastHist >= 0 ? 'ALCISTA' : 'BAJISTA'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <AlertPanel />
        </div>

        {/* Charts Section */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Main Chart 4H */}
          <div className="glass-panel p-6 h-[400px]">
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <BarChart3 size={16} /> Movimiento 4 Horas
              </h3>
            </div>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={history4h}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={selectedAsset.color} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={selectedAsset.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} orientation="right" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111218', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }} 
                  labelFormatter={(t) => new Date(t).toLocaleString()}
                />
                <Area type="monotone" dataKey="price" stroke={selectedAsset.color} fill="url(#colorPrice)" strokeWidth={3} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Triple RSI Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RSIChart data={history4h} title="RSI 4 Horas" color="#6366f1" />
            <RSIChart data={historyDaily} title="RSI Diario" color="#3b82f6" />
            <RSIChart data={historyWeekly} title="RSI Semanal" color="#818cf8" />
          </div>

          {/* Triple MACD Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MACDChart data={history4h} title="MACD 4H (Hist)" positiveColor="#6366f1" />
            <MACDChart data={historyDaily} title="MACD Diario (Hist)" positiveColor="#3b82f6" />
            <MACDChart data={historyWeekly} title="MACD Semanal (Hist)" positiveColor="#10b981" />
          </div>
        </div>
      </div>

      <footer className="mt-6 text-center text-slate-700 text-[9px] font-mono tracking-[0.4em] uppercase">
        PWA CLEAN ARCHITECTURE • yfinance LIVE DATA • ASYNC MICROSERVICES
      </footer>
    </div>
  );
};

export default App;
