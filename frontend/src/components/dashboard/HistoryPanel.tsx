import React from 'react';
import { useMarketStore } from '../../store/useMarketStore';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Bell, Zap, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export const HistoryPanel: React.FC = () => {
  const { alerts, isAlarmActive, setAlarmActive } = useMarketStore();

  return (
    <Card 
      title="Alertas" 
      icon={<Bell size={14} className={isAlarmActive ? "animate-bounce text-rose-500" : ""} />}
      className="flex-1 min-h-0 flex flex-col"
    >
      <div className="flex items-center justify-between mb-3 shrink-0">
        <Badge variant={isAlarmActive ? 'danger' : 'neutral'} className="text-[10px]">
          {alerts.length} Detectadas
        </Badge>
        
        {isAlarmActive && (
          <button 
            onClick={() => setAlarmActive(false)}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-black rounded-full animate-pulse transition-all shadow-lg shadow-rose-600/20"
          >
            <XCircle size={10} /> PARAR
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-8">
            <Zap size={20} className="mb-2" />
            <p className="text-[9px] font-black uppercase tracking-widest text-center">Esperando señales...</p>
          </div>
        ) : (
          alerts.slice().reverse().map((alert) => (
            <div 
              key={alert.id} 
              className={cn(
                "p-2.5 rounded-xl border transition-all",
                alert.type === 'LONG' ? "bg-emerald-500/5 border-emerald-500/10" : 
                alert.type === 'SHORT' ? "bg-rose-500/5 border-rose-500/10" : 
                "bg-amber-500/5 border-amber-500/10"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black text-white">{alert.symbol}</span>
                <span className="text-[8px] font-bold text-gray-600">{alert.time}</span>
              </div>
              
              <p className={cn(
                "text-[10px] font-bold leading-tight mb-2",
                alert.type === 'LONG' ? "text-emerald-400" : 
                alert.type === 'SHORT' ? "text-rose-400" : 
                "text-amber-400"
              )}>
                {alert.message}
              </p>

              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded uppercase">1H</span>
                <div className="flex-1" />
                <span className="text-[9px] font-black text-white">R:{alert.rsi?.toFixed(0)}</span>
                <span className="text-[9px] font-black text-white">S:{alert.stochK?.toFixed(0)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
