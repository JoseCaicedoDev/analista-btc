import React from 'react';
import { useMarketStore } from '../../store/useMarketStore';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Bell, Zap, XCircle } from 'lucide-react';

export const HistoryPanel: React.FC = () => {
  const { alerts, isAlarmActive, setAlarmActive } = useMarketStore();

  return (
    <Card 
      title="Historial de Alertas" 
      icon={<Bell size={14} className={isAlarmActive ? "animate-bounce text-rose-500" : ""} />}
      className="flex-[2] min-h-0 flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <Badge variant={isAlarmActive ? 'danger' : 'neutral'} dot={isAlarmActive}>
          {alerts.length} Detectadas
        </Badge>
        
        {isAlarmActive && (
          <button 
            onClick={() => setAlarmActive(false)}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black rounded-full animate-pulse transition-all shadow-lg shadow-rose-600/20"
          >
            <XCircle size={12} /> PARAR ALARMA
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 py-12">
            <Zap size={24} className="mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Esperando Señales...</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={cn(
                "p-4 rounded-xl border transition-all",
                alert.type === 'LONG' ? "bg-emerald-500/5 border-emerald-500/20" : 
                alert.type === 'SHORT' ? "bg-rose-500/5 border-rose-500/20" : 
                "bg-amber-500/5 border-amber-500/20"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">{alert.symbol}</span>
                  <Badge variant="neutral" className="bg-white/5 border-white/10">{alert.timeframe}</Badge>
                </div>
                <span className="text-[9px] font-bold text-gray-600">{alert.time}</span>
              </div>
              
              <p className={cn(
                "text-[11px] font-bold mb-3 leading-tight",
                alert.type === 'LONG' ? "text-emerald-400" : 
                alert.type === 'SHORT' ? "text-rose-400" : 
                "text-amber-400"
              )}>
                {alert.message}
              </p>

              <div className="flex items-center gap-2 opacity-80 scale-90 origin-left">
                <Badge variant="neutral" className="text-[8px]">RSI {alert.rsi?.toFixed(1)}</Badge>
                <Badge variant="neutral" className="text-[8px]">MACD {alert.macd?.toFixed(2)}</Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

// Helper for classes inside the component file if not using global cn
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
