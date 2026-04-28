import React from 'react';
import { Zap } from 'lucide-react';
import { useMarketStore } from '../../store/useMarketStore';
import { calculateRSIDivergence } from '../../domain/indicators';

export const StrengthSummary: React.FC = () => {
  const { history4h, historyDaily, historyWeekly } = useMarketStore();

  const getData = (history: any[], label: string) => {
    const div = calculateRSIDivergence(history);
    let color = 'text-slate-400';
    let bg = 'bg-slate-900/20';
    
    if (div.type === 'bullish') {
      color = 'text-green-500';
      bg = 'bg-green-500/10';
    } else if (div.type === 'bearish') {
      color = 'text-red-500';
      bg = 'bg-red-500/10';
    } else if (div.type === 'bearish_vol') {
      color = 'text-orange-500';
      bg = 'bg-orange-500/10';
    }

    return {
      label,
      value: div.value.toFixed(1),
      status: div.type === 'none' ? 'NEUTRAL' : div.type.toUpperCase(),
      color,
      bg
    };
  };

  const rows = [
    getData(history4h, '4H'),
    getData(historyDaily, '1D'),
    getData(historyWeekly, '1W')
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800/50 pb-2">
        <Zap className="w-3 h-3 text-amber-400 fill-amber-400 shadow-glow-amber" />
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resumen Fuerza</h2>
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className={`flex items-center justify-between p-2 rounded-lg border border-slate-800/30 ${row.bg}`}>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold text-slate-500 w-5">{row.label}</span>
              <span className="text-sm font-black text-blue-400 font-mono tracking-tighter">{row.value}</span>
            </div>
            <span className={`text-[8px] font-black tracking-widest ${row.color}`}>
              {row.status === 'BULLISH' ? 'ALCISTA' : row.status === 'BEARISH' ? 'BAJISTA' : row.status === 'BEARISH_VOL' ? 'BAJISTA (VOL)' : 'NEUTRAL'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
