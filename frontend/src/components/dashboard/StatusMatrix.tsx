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

  const getMACDLabel = (color: string | null) => {
    if (!color) return '--';
    if (color === 'red' || color === 'maroon') return 'BAJISTA';
    if (color === 'green' || color === 'lime') return 'ALCISTA';
    return color.toUpperCase();
  };

  return (
    <Card title="Tokens en Estudio (1H)" icon={<Target size={14} />} className="flex-1 min-h-0">
      <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
        {list.length === 0 ? (
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest text-center py-8">Iniciando escáner...</p>
        ) : (
          list.map((s) => (
            <div key={s.symbol} className="p-2.5 rounded-xl bg-gray-950/40 border border-gray-800/30 hover:border-primary-500/30 transition-colors">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" style={{ backgroundColor: s.color }} />
                  <span className="text-xs font-black text-white tracking-tight">{s.symbol}</span>
                </div>
                <span className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter">{s.lastScanned}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-1.5">
                <Badge 
                  variant={s.rsi && s.rsi < 30 ? 'danger' : s.rsi && s.rsi > 70 ? 'success' : 'neutral'}
                  className="justify-center py-1"
                >
                  RSI: {s.rsi?.toFixed(1) || '--'}
                </Badge>
                
                <Badge 
                  variant={(s.stochK || 0) < 20 && (s.stochD || 0) < 20 ? 'danger' : (s.stochK || 0) > 80 && (s.stochD || 0) > 80 ? 'success' : 'neutral'}
                  className="justify-center py-1"
                >
                  ST: {s.stochK?.toFixed(0)}/{s.stochD?.toFixed(0)}
                </Badge>

                <Badge 
                  variant={s.histColor === 'red' || s.histColor === 'maroon' ? 'danger' : 'success'}
                  className="col-span-2 justify-center py-1"
                >
                  MACD: {getMACDLabel(s.histColor)}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
