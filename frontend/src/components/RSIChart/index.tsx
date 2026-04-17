import React from 'react';
import { LineChart, Line, YAxis, CartesianGrid, ReferenceLine, ReferenceArea, ResponsiveContainer, Tooltip } from 'recharts';
import type { DataPoint } from '../../domain/indicators';

interface RSIChartProps {
  data: DataPoint[];
  title: string;
  color?: string;
}

export const RSIChart: React.FC<RSIChartProps> = ({ data, title }) => {
  return (
    <div className="glass-panel p-4 h-full flex flex-col min-h-0">
      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{title}</h4>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <YAxis domain={[0, 100]} orientation="right" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111218', border: 'none', borderRadius: '8px', fontSize: '10px' }} 
            labelFormatter={(t) => new Date(t).toLocaleString()}
          />
          <ReferenceLine y={70} stroke="#787B86" strokeDasharray="3 3" />
          <ReferenceLine y={50} stroke="#787B8650" strokeDasharray="3 3" />
          <ReferenceLine y={30} stroke="#787B86" strokeDasharray="3 3" />
          
          {/* Custom Fills for RSI Zones */}
          <ReferenceArea y1={70} y2={100} fill="rgba(34, 197, 94, 0.05)" />
          <ReferenceArea y1={0} y2={30} fill="rgba(239, 68, 68, 0.05)" />
          <ReferenceArea y1={30} y2={70} fill="rgba(126, 87, 194, 0.05)" />

          <Line type="monotone" dataKey="rsi" stroke="#7E57C2" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="rsiMA" stroke="#EAB308" strokeWidth={1} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
