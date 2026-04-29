import React from 'react';
import { useMarketStore } from '../../store/useMarketStore';
import { cn } from '../../utils/cn';
import { TrendingUp, Activity, Zap } from 'lucide-react';

export const ETFMatrix: React.FC = () => {
  const { etfs, etfData } = useMarketStore();

  if (etfs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 opacity-50">
        <Activity className="animate-pulse mb-2" />
        <p className="text-xs font-bold uppercase tracking-widest">Cargando datos de ETFs...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {etfs.map((etf) => {
        const data = etfData[etf.symbol];
        
        return (
          <div 
            key={etf.symbol}
            className="bg-[#08090a] border border-[#1f2937] rounded-2xl p-5 hover:border-blue-500/50 transition-all group overflow-hidden relative"
          >
            {/* Background Accent */}
            <div 
              className="absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full"
              style={{ backgroundColor: etf.color }}
            />

            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: etf.color }}
                  />
                  <h3 className="text-lg font-black text-white tracking-tight">{etf.symbol}</h3>
                </div>
                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{etf.name}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-mono font-bold text-white">
                  ${data?.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '---'}
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase">Último Cierre</p>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-6 line-clamp-2 leading-relaxed">
              {etf.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {/* RSI Badge */}
              <div className={cn(
                "flex items-center px-3 py-1.5 rounded-full border text-[10px] font-black tracking-tighter transition-colors",
                (data?.rsi || 0) > 70 ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                (data?.rsi || 0) < 30 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                "bg-blue-500/10 border-blue-500/20 text-blue-400"
              )}>
                <Activity size={12} className="mr-1.5 opacity-70" />
                <span className="mr-1 opacity-70">RSI:</span>
                <span>{data?.rsi?.toFixed(1) || '--'}</span>
              </div>

              {/* MACD Badge */}
              <div className={cn(
                "flex items-center px-3 py-1.5 rounded-full border text-[10px] font-black tracking-tighter transition-colors",
                (data?.macd || 0) > (data?.signal || 0) ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              )}>
                <TrendingUp size={12} className="mr-1.5 opacity-70" />
                <span className="mr-1 opacity-70">MACD:</span>
                <span className="font-mono">
                  {(data?.macd - data?.signal) > 0 ? '+' : ''}{(data?.macd - data?.signal)?.toFixed(2) || '--'}
                </span>
              </div>

              {/* STOCH Badge */}
              <div className={cn(
                "flex items-center px-3 py-1.5 rounded-full border text-[10px] font-black tracking-tighter transition-colors",
                (data?.stochK || 0) > 80 ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                (data?.stochK || 0) < 20 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                "bg-amber-500/10 border-amber-500/20 text-amber-400"
              )}>
                <Zap size={12} className="mr-1.5 opacity-70" />
                <span className="mr-1 opacity-70">STOCH:</span>
                <span>K:{data?.stochK?.toFixed(0) || '--'} D:{data?.stochD?.toFixed(0) || '--'}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
