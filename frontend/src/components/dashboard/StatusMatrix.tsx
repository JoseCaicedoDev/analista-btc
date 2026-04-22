import React, { useState, useEffect } from 'react';
import { subscribeScanStatus, type TokenScanStatus } from '../../hooks/useStrategyScanner';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Target } from 'lucide-react';

export const StatusMatrix: React.FC = () => {
  const [statuses, setStatuses] = useState<Record<string, TokenScanStatus>>({});

  useEffect(() => {
    return subscribeScanStatus(setStatuses);
  }, []);

  const list = Object.values(statuses);

  const getMACDStatus = (color: string | null) => {
    if (!color) return { label: '--', variant: 'neutral' as const };
    const c = color.toLowerCase();
    
    // Mapeo de colores del motor TradingView/MACD
    if (c === '#26a69a' || c === 'green') return { label: 'ALCISTA', variant: 'success' as const };
    if (c === '#b2dfdb' || c === 'lime') return { label: 'ALCISTA (D)', variant: 'success' as const };
    if (c === '#ff5252' || c === 'red') return { label: 'BAJISTA', variant: 'danger' as const };
    if (c === '#ffcdd2' || c === 'maroon') return { label: 'BAJISTA (D)', variant: 'danger' as const };
    
    return { label: c.toUpperCase(), variant: 'neutral' as const };
  };

  return (
    <Card title="Escáner en Tiempo Real (1H)" icon={<Target size={14} />} className="flex-1 min-h-0">
      <div className="space-y-2.5 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
        {list.length === 0 ? (
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest text-center py-8">Iniciando escáner...</p>
        ) : (
          list.map((s) => {
            const macd = getMACDStatus(s.histColor);
            return (
              <div key={s.symbol} className="p-3 rounded-xl bg-gray-950/40 border border-gray-800/30 hover:border-primary-500/30 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" style={{ backgroundColor: s.color }} />
                    <span className="text-sm font-black text-white tracking-tight group-hover:text-primary-400 transition-colors">{s.symbol}</span>
                  </div>
                  <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">{s.lastScanned}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-gray-600 uppercase ml-1">RSI</span>
                    <Badge 
                      variant={s.rsi && s.rsi < 30 ? 'danger' : s.rsi && s.rsi > 70 ? 'success' : 'neutral'}
                      className="justify-center py-1.5 w-full border-none bg-gray-900/50"
                    >
                      {s.rsi?.toFixed(1) || '--'}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-gray-600 uppercase ml-1">STOCH</span>
                    <Badge 
                      variant={(s.stochK || 0) < 20 && (s.stochD || 0) < 20 ? 'danger' : (s.stochK || 0) > 80 && (s.stochD || 0) > 80 ? 'success' : 'neutral'}
                      className="justify-center py-1.5 w-full border-none bg-gray-900/50"
                    >
                      {s.stochK?.toFixed(0)}/{s.stochD?.toFixed(0)}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-black text-gray-600 uppercase ml-1">MACD</span>
                    <Badge 
                      variant={macd.variant}
                      className="justify-center py-1.5 w-full border-none bg-gray-900/50 text-[9px]"
                    >
                      {macd.label}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
