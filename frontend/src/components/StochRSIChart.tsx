import React from 'react';
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, Tooltip } from 'recharts';
import { useMarketStore } from '../store/useMarketStore';

export const StochRSIChart: React.FC = () => {
  const { history1h } = useMarketStore();
  const data = history1h.slice(-100);

  return (
    <div className="w-full h-full min-h-0 flex flex-col">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
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
              labelFormatter={(t) => new Date(t).toLocaleString()}
              itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
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
