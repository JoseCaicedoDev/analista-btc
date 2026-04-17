import React from 'react';
import { Bell } from 'lucide-react';
import { useMarketStore } from '../../store/useMarketStore';

export const AlertPanel: React.FC = () => {
  const { alerts } = useMarketStore();

  return (
    <div className="glass-panel p-6 min-h-[160px]">
      <h3 className="text-xs font-bold text-slate-400 uppercase mb-5 flex items-center gap-2 tracking-widest">
        <Bell size={14} className="text-blue-400" /> Historial Alertas
      </h3>
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
        {alerts.length === 0 ? (
          <p className="text-[11px] text-slate-600 italic">Buscando patrones en 4H, D, W...</p>
        ) : (
          alerts.map((a, idx) => (
            <div key={idx} className="bg-slate-950/80 p-3 rounded-xl border-l-4 border-indigo-500 shadow-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">{a.type}</span>
                <span className="text-[8px] text-slate-600 font-bold">NOW</span>
              </div>
              <p className="text-[11px] font-semibold text-slate-300 leading-snug">{a.msg}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
