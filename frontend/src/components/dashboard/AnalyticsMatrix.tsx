import React from 'react';
import { useMarketStore } from '../../store/useMarketStore';
import { Card } from '../shared/Card';
import { StochRSIChart } from '../StochRSIChart';
import { RSIChart } from '../RSIChart';
import { MACDChart } from '../MACDChart';
import { BarChart3, LineChart, Activity } from 'lucide-react';

export const AnalyticsMatrix: React.FC = () => {
  const { history4h, historyDaily, historyWeekly } = useMarketStore();

  const timeframes = [
    { label: '4 Horas', data: history4h },
    { label: 'Diario', data: historyDaily },
    { label: 'Semanal', data: historyWeekly },
  ];

  const indicators = [
    { label: 'Stoch RSI', icon: <Activity size={12} />, Component: StochRSIChart },
    { label: 'RSI Relativo', icon: <LineChart size={12} />, Component: RSIChart },
    { label: 'MACD Pro', icon: <BarChart3 size={12} />, Component: MACDChart },
  ];

  return (
    <div className="flex-1 grid grid-rows-3 gap-6 min-h-0">
      {indicators.map((ind, i) => (
        <div key={i} className="grid grid-cols-3 gap-6">
          {timeframes.map((tf, j) => (
            <Card key={`${i}-${j}`} title={`${ind.label} ${tf.label}`} icon={ind.icon} className="h-full">
              <div className="h-full min-h-[120px]">
                <ind.Component data={tf.data} title="" />
              </div>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
};
