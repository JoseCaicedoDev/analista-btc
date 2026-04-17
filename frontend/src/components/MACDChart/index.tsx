import React from 'react';
import { BarChart, Bar, Line, ResponsiveContainer, Cell, XAxis, YAxis, Tooltip } from 'recharts';
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
          <XAxis dataKey="time" hide />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111218', border: 'none', borderRadius: '8px', fontSize: '10px' }} 
            labelFormatter={(t) => new Date(t).toLocaleString()}
          />
          <Bar dataKey="hist" isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.histColor || ((entry.hist ?? 0) >= 0 ? positiveColor : negativeColor)} 
              />
            ))}
          </Bar>
          {/* MACD and Signal Lines from MACD.txt */}
          <Line type="monotone" dataKey="macd" stroke="#2196F3" strokeWidth={1} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="signal" stroke="#ff6d00" strokeWidth={1} dot={false} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

