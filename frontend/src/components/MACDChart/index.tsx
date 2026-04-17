import React from 'react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import type { DataPoint } from '../../domain/indicators';

interface MACDChartProps {
  data: DataPoint[];
  title: string;
  positiveColor?: string;
  negativeColor?: string;
}

export const MACDChart: React.FC<MACDChartProps> = ({ 
  data, 
  title, 
  positiveColor = "#6366f1", 
  negativeColor = "#f43f5e" 
}) => {
  return (
    <div className="glass-panel p-5 h-[200px]">
      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{title}</h4>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data}>
          <Bar dataKey="hist" isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.histColor || ((entry.hist ?? 0) >= 0 ? positiveColor : negativeColor)} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

