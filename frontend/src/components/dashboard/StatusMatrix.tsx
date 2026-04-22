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

  return (
    <Card title="Tokens en Estudio (1H)" icon={<Target size={14} />} className="flex-1 min-h-0">
      <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
        {list.length === 0 ? (
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest text-center py-8">Iniciando escáner...</p>
        ) : (
          list.map((s) => (
            <div key={s.symbol} className="p-3 rounded-xl bg-gray-950/50 border border-gray-800/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs font-black text-white">{s.symbol}</span>
                </div>
                <span className="text-[9px] font-bold text-gray-600">{s.lastScanned}</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant={s.rsi && s.rsi < 30 ? 'danger' : s.rsi && s.rsi > 70 ? 'success' : 'neutral'}>
                  RSI: {s.rsi?.toFixed(1) || '--'}
                </Badge>
                
                <Badge variant={s.histColor === 'red' || s.histColor === 'maroon' ? 'danger' : 'success'}>
                  MACD: {s.histColor || '--'}
                </Badge>

                <Badge variant={(s.stochK || 0) < 20 && (s.stochD || 0) < 20 ? 'danger' : (s.stochK || 0) > 80 && (s.stochD || 0) > 80 ? 'success' : 'neutral'}>
                  Stoch: {s.stochK?.toFixed(0)}/{s.stochD?.toFixed(0)}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
