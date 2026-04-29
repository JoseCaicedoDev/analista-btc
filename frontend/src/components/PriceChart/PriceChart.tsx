import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Bar, ComposedChart } from 'recharts';
import type { DataPoint } from '../../domain/indicators';

interface PriceChartProps {
  data: DataPoint[];
  title: string;
  syncId?: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({ data: propData, syncId }) => {
  // Limitar a los últimos 50 puntos
  const data = propData.slice(-50);

  return (
    <div className="w-full h-full min-h-0 flex flex-col group">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} syncId={syncId}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} opacity={0.2} />
            <XAxis dataKey="time" hide />
            <YAxis 
              domain={['auto', 'auto']} 
              orientation="right" 
              tick={{ fontSize: 9, fill: '#6b7280', fontWeight: 'bold' }} 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#08090a', border: '1px solid #1f2937', borderRadius: '12px', fontSize: '10px' }}
              labelFormatter={(t) => new Date(Number(t) * 1000).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              formatter={(v, name) => [
                name === 'Volumen' ? Number(v).toLocaleString() : `$${Number(v).toLocaleString()}`, 
                name === 'price' ? 'Precio' : name
              ]}
              itemStyle={{ fontSize: '10px', fontWeight: 'bold', padding: '2px 0' }}
              cursor={{ stroke: '#38bdf8', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            
            {/* Price Area */}
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
              dot={false}
              isAnimationActive={false}
              name="Precio"
            />

            {/* Volume Bars at bottom (scaled down) */}
            <Bar 
              dataKey="volume" 
              fill="#1f2937" 
              opacity={0.4} 
              isAnimationActive={false} 
              name="Volumen"
              yAxisId={0}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
