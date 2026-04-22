import React, { useState, useEffect } from 'react';
import { subscribeScanStatus, type TokenScanStatus } from '../../hooks/useStrategyScanner';
import { Card } from '../shared/Card';
import { Target, Activity, ArrowUp, ArrowDown } from 'lucide-react';

export const StatusMatrix: React.FC = () => {
  const [statuses, setStatuses] = useState<Record<string, TokenScanStatus>>({});

  useEffect(() => {
    return subscribeScanStatus(setStatuses);
  }, []);

  const list = Object.values(statuses);

  const getMACDStatus = (color: string | null) => {
    if (!color) return { label: '---', variant: 'neutral' as const, icon: null };
    const c = color.toLowerCase();
    
    if (c === '#26a69a' || c === 'green') 
      return { label: 'Verde oscuro ↑', variant: 'danger' as const, icon: <ArrowUp size={10} /> };
    if (c === '#b2dfdb' || c === 'lime') 
      return { label: 'Verde claro ↑', variant: 'danger' as const, icon: <ArrowUp size={10} /> };
    if (c === '#ff5252' || c === 'red') 
      return { label: 'Rojo oscuro ↓', variant: 'success' as const, icon: <ArrowDown size={10} /> };
    if (c === '#ffcdd2' || c === 'maroon') 
      return { label: 'Rojo claro ↓', variant: 'success' as const, icon: <ArrowDown size={10} /> };
    
    return { label: 'Neutral', variant: 'neutral' as const, icon: null };
  };

  return (
    <Card title="Escáner" icon={<Target size={14} />} className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        <div className="p-3 space-y-3">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-30">
              <Activity className="animate-spin mb-2" size={20} />
              <p className="text-[11px] font-black uppercase tracking-widest text-center">Sincronizando...</p>
            </div>
          ) : (
            list.map((s) => {
              return (
                <div key={s.symbol} className="p-3 rounded-xl bg-gray-950/20 border border-gray-800/20 hover:border-primary-500/30 transition-all">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-sm font-black text-white uppercase tracking-tight">{s.symbol}</span>
                    </div>
                    <span className="text-[9px] font-bold text-gray-600 tabular-nums uppercase">{s.lastScanned}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {/* Badge RSI (DAILY) */}
                    <div className={cn(
                      "flex items-center px-2.5 py-1 rounded-full border text-[11px] font-black whitespace-nowrap",
                      (s.rsiDaily || 0) > 70 ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                      (s.rsiDaily || 0) < 30 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                      "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    )}>
                      <span className="mr-1.5 opacity-70">RSI D</span>
                      <span>{s.rsiDaily?.toFixed(1) || '--'}</span>
                    </div>

                    {/* Badge MACD (DAILY) */}
                    {(() => {
                      const macdDaily = getMACDStatus(s.macdHistColorDaily);
                      return (
                        <div className={cn(
                          "flex items-center px-2.5 py-1 rounded-full border text-[11px] font-black whitespace-nowrap",
                          macdDaily.variant === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                          macdDaily.variant === 'danger' ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                          "bg-gray-900/50 border-gray-800/30 text-gray-400"
                        )}>
                          <div className={cn("w-2 h-2 rounded-full mr-2", 
                            macdDaily.label.includes('Verde') ? 'bg-emerald-500' : 
                            macdDaily.label.includes('Rojo') ? 'bg-rose-500' : 'bg-gray-500'
                          )} />
                          <span>{macdDaily.label} D</span>
                        </div>
                      );
                    })()}

                    {/* Badge STOCH */}
                    <div className={cn(
                      "flex items-center px-2.5 py-1 rounded-full border text-[11px] font-black whitespace-nowrap transition-colors",
                      (s.stochK || 0) > 80 ? "bg-rose-500/10 border-rose-500/20 text-rose-400" :
                      (s.stochK || 0) < 20 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                      "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    )}>
                      <div className={cn("w-2 h-2 rounded-full mr-2", 
                        (s.stochK || 0) > 80 ? 'bg-rose-500' : 
                        (s.stochK || 0) < 20 ? 'bg-emerald-500' : 'bg-amber-500'
                      )} />
                      <span className="mr-1.5 opacity-70">Stoch 1H</span>
                      <div className="flex gap-2">
                        <span className="text-blue-400">K:{s.stochK?.toFixed(1)}</span>
                        <span className="text-orange-400">D:{s.stochD?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
