import React from 'react';
import { Area, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, Line, ComposedChart } from 'recharts';
import { calculateRSIDivergence } from '../../domain/indicators';
import type { DataPoint } from '../../domain/indicators';

interface RSIChartProps {
  data: DataPoint[];
  title: string;
  color?: string;
  syncId?: string;
}

export const RSIChart: React.FC<RSIChartProps> = ({ data: propData, syncId }) => {
  // Limitar a los últimos 50 puntos
  const rawData = propData.slice(-50);

  const div = calculateRSIDivergence(propData);
  const data = rawData.map(d => {
    const isP1 = div.p1?.time === d.time;
    const isP2 = div.p2?.time === d.time;
    return {
      ...d,
      divLineRSI: (isP1 || isP2) ? (isP1 ? div.p1?.rsi : div.p2?.rsi) : null
    };
  });

  const divColor = div.type === 'bullish' ? '#10b981' : (div.type === 'bearish' ? '#f43f5e' : '#f59e0b');

  return (
    <div className="w-full h-full min-h-0 flex flex-col group">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} syncId={syncId}>
            <defs>
              <linearGradient id="colorRsi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} opacity={0.2} />
            <XAxis dataKey="time" hide />
            <YAxis 
              domain={[20, 80]} 
              orientation="right" 
              tick={{ fontSize: 9, fill: '#6b7280', fontWeight: 'bold' }} 
              axisLine={false} 
              tickLine={false} 
              ticks={[30, 50, 70]}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#08090a', border: '1px solid #1f2937', borderRadius: '12px', fontSize: '10px' }}
              labelFormatter={(t) => new Date(Number(t) * 1000).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              formatter={(v) => [Number(v).toFixed(1), undefined]}
              itemStyle={{ fontSize: '10px', fontWeight: 'bold', padding: '2px 0' }}
              cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }}
            />

            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" opacity={0.3} />
            <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" opacity={0.3} />

            {/* RSI MA (Amber) */}
            <Area
              type="monotone"
              dataKey="rsiMA"
              stroke="#f59e0b"
              strokeWidth={1}
              fill="transparent"
              dot={false}
              isAnimationActive={false}
              name="RSI MA"
            />
            {/* RSI Line (Violet) with Area Fill */}
            <Area
              type="monotone"
              dataKey="rsi"
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRsi)"
              dot={false}
              isAnimationActive={false}
              name="RSI"
            />

            {/* Línea de Divergencia RSI */}
            {div.type !== 'none' && (
              <Line
                type="linear"
                dataKey="divLineRSI"
                stroke={divColor}
                strokeWidth={2}
                dot={{ r: 4, fill: divColor, strokeWidth: 2, stroke: '#000' }}
                connectNulls
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
