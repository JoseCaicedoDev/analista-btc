import React, { useState } from 'react';
import { useMarketStore } from '../../store/useMarketStore';
import { Card } from '../shared/Card';
import { StochRSIChart } from '../StochRSIChart';
import { RSIChart } from '../RSIChart';
import { MACDChart } from '../MACDChart';
import { BarChart3, LineChart, Activity, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

export const AnalyticsMatrix: React.FC = () => {
  const { history1h, history4h, historyDaily } = useMarketStore();
  const [activeTab, setActiveTab] = useState<'1h' | '4h' | 'daily'>('1h');

  const timeframes = [
    { id: '1h', label: '1 Hora', data: history1h },
    { id: '4h', label: '4 Horas', data: history4h },
    { id: 'daily', label: 'Diario', data: historyDaily },
  ] as const;

  const indicators = [
    { label: 'Stoch RSI', icon: <Activity size={12} />, Component: StochRSIChart },
    { label: 'RSI Relativo', icon: <LineChart size={12} />, Component: RSIChart },
    { label: 'MACD Pro', icon: <BarChart3 size={12} />, Component: MACDChart },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 min-h-0">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex p-1 bg-gray-900 border border-gray-800 rounded-xl">
        {timeframes.map((tf) => (
          <button
            key={tf.id}
            onClick={() => setActiveTab(tf.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
              activeTab === tf.id ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <Clock size={12} />
            {tf.label}
          </button>
        ))}
      </div>

      {/* Analytics Display */}
      <div className="flex-1 overflow-hidden">
        {/* Desktop Grid: Show all 3x3 */}
        <div className="hidden lg:grid lg:grid-rows-3 gap-6 h-full min-h-0">
          {indicators.map((ind, i) => (
            <div key={i} className="grid grid-cols-3 gap-6">
              {timeframes.map((tf, j) => (
                <Card key={`${i}-${j}`} title={`${ind.label} ${tf.label}`} icon={ind.icon} className="h-full">
                  <div className="h-full min-h-[140px]">
                    <ind.Component data={tf.data} title="" />
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>

        {/* Mobile View: Show only the active tab timeframe (3 rows) */}
        <div className="lg:hidden flex flex-col gap-4 overflow-y-auto h-full pr-1 custom-scrollbar">
          {indicators.map((ind, i) => {
            const tf = timeframes.find(t => t.id === activeTab)!;
            return (
              <Card key={i} title={`${ind.label} ${tf.label}`} icon={ind.icon} className="min-h-[220px]">
                <div className="h-full">
                  <ind.Component data={tf.data} title="" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
