import React from 'react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Bar, ComposedChart, Cell, Line } from 'recharts';
import type { DataPoint } from '../../domain/indicators';

interface PriceChartProps {
  data: DataPoint[];
  title: string;
  syncId?: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({ data: propData, syncId }) => {
  // Limitar a los últimos 50 puntos
  const rawData = propData.slice(-50);

  // Transformar datos para velas y divergencias
  const div = calculateRSIDivergence(propData);
  const data = rawData.map(d => {
    const isP1 = div.p1?.time === d.time;
    const isP2 = div.p2?.time === d.time;
    
    return {
      ...d,
      body: [d.open ?? 0, d.close ?? 0],
      wick: [d.low ?? 0, d.high ?? 0],
      color: (d.close ?? 0) >= (d.open ?? 0) ? '#10b981' : '#ef4444',
      divLine: (isP1 || isP2) ? (isP1 ? div.p1?.price : div.p2?.price) : null
    };
  });

  const divColor = div.type === 'bullish' ? '#10b981' : (div.type === 'bearish' ? '#f43f5e' : '#f59e0b');

  return (
    <div className="w-full h-full min-h-0 flex flex-col group">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} syncId={syncId} margin={{ top: 10, right: 0, bottom: 0, left: 0 }} barGap="-100%">
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
              formatter={(v: any, name, props) => {
                // props.payload contains the full data point
                const d = props.payload;
                if (name === 'body') {
                  return [
                    <div className="flex flex-col gap-1 text-gray-200">
                      <div className="flex justify-between gap-4"><span>O:</span> <span className="text-white font-mono">{d.open?.toFixed(2)}</span></div>
                      <div className="flex justify-between gap-4"><span>H:</span> <span className="text-white font-mono">{d.high?.toFixed(2)}</span></div>
                      <div className="flex justify-between gap-4"><span>L:</span> <span className="text-white font-mono">{d.low?.toFixed(2)}</span></div>
                      <div className="flex justify-between gap-4"><span>C:</span> <span className="text-white font-mono">{d.close?.toFixed(2)}</span></div>
                    </div>,
                    null
                  ];
                }
                return [null, null];
              }}
              itemStyle={{ color: '#f3f4f6', fontSize: '10px', fontWeight: 'bold' }}
              cursor={{ stroke: '#38bdf8', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            
            {/* Mechas (Wicks) - Usamos una barra muy delgada */}
            <Bar dataKey="wick" isAnimationActive={false} barSize={1}>
              {data.map((entry, index) => (
                <Cell key={`wick-${index}`} fill={entry.color} />
              ))}
            </Bar>

            {/* Cuerpo (Body) - Usamos una barra normal */}
            <Bar dataKey="body" isAnimationActive={false} barSize={6}>
              {data.map((entry, index) => (
                <Cell key={`body-${index}`} fill={entry.color} />
              ))}
            </Bar>

            {/* Línea de Divergencia */}
            {div.type !== 'none' && (
              <Line
                type="linear"
                dataKey="divLine"
                stroke={divColor}
                strokeWidth={2}
                dot={{ r: 4, fill: divColor, strokeWidth: 2, stroke: '#000' }}
                connectNulls
                isAnimationActive={false}
                label={{
                  position: 'top',
                  fill: divColor,
                  fontSize: 10,
                  fontWeight: 'bold',
                  formatter: () => div.type === 'bullish' ? 'DIV' : 'DIV'
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
