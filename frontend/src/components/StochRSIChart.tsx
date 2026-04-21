import React from 'react';
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, Tooltip } from 'recharts';
import { useMarketStore } from '../store/useMarketStore';

interface StochRSIChartProps {
  data?: any[];
  title?: string;
  syncId?: string;
}

export const StochRSIChart: React.FC<StochRSIChartProps> = ({ data: propData, title, syncId }) => {
  const { history1h } = useMarketStore();
  const data = propData || history1h.slice(-100);

  return (
    <div className="w-full h-full min-h-0 flex flex-col">
      {title && (
        <div className="flex justify-between items-center mb-1 shrink-0 px-1">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{title}</span>
          <div className="flex gap-2 text-[8px] font-bold">
            <span className="text-[#2962FF]">K</span>
            <span className="text-[#FF6D00]">D</span>
          </div>
        </div>
      )}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <ComposedChart data={data} syncId={syncId}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
            <XAxis dataKey="time" hide />
            <YAxis 
              domain={[0, 100]} 
              orientation="right" 
              tick={{ fontSize: 8, fill: '#64748b' }} 
              axisLine={false} 
              tickLine={false} 
              ticks={[20, 50, 80]}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#111218', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
              labelFormatter={(t) => new Date(Number(t) * 1000).toLocaleString()}
              formatter={(v) => [Number(v).toFixed(2), undefined]}
              itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
              cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 2' }}
            />

            {/* Bands */}
            <ReferenceLine y={80} stroke="#787B86" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={50} stroke="#787B86" strokeDasharray="3 3" opacity={0.2} />
            <ReferenceLine y={20} stroke="#787B86" strokeDasharray="3 3" opacity={0.5} />

            {/* Stoch RSI Background Fill Area - approximated using ReferenceArea, but ComposedChart doesn't easily support ReferenceArea between lines.
                Instead, we can just use the reference lines. */}
            
            {/* D Line (Orange) */}
            <Line
              type="monotone"
              dataKey="stochD"
              stroke="#FF6D00"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              name="Stoch D"
            />
            {/* K Line (Blue) */}
            <Line
              type="monotone"
              dataKey="stochK"
              stroke="#2962FF"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              name="Stoch K"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
