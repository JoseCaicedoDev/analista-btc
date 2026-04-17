import React from 'react';
import { LineChart, Line, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer } from 'recharts';
import type { DataPoint } from '../../domain/indicators';

interface RSIChartProps {
  data: DataPoint[];
  title: string;
  color?: string;
}

export const RSIChart: React.FC<RSIChartProps> = ({ data, title, color = "#6366f1" }) => {
  return (
    <div className="glass-panel p-5 h-[200px]">
      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{title}</h4>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <YAxis domain={[0, 100]} ticks={[30, 70]} hide />
          <ReferenceLine y={70} stroke="#ef4444" strokeOpacity={0.3} />
          <ReferenceLine y={30} stroke="#22c55e" strokeOpacity={0.3} />
          <Line 
            type="monotone" 
            dataKey="rsi" 
            stroke={color} 
            strokeWidth={2} 
            dot={false} 
            isAnimationActive={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
