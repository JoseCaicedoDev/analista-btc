import React from 'react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Bar, ComposedChart, Cell } from 'recharts';
import type { DataPoint } from '../../domain/indicators';

interface PriceChartProps {
  data: DataPoint[];
  title: string;
  syncId?: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({ data: propData, syncId }) => {
  // Limitar a los últimos 50 puntos
  const rawData = propData.slice(-50);

  // Transformar datos para velas
  const data = rawData.map(d => ({
    ...d,
    // La vela se compone de dos partes en Recharts: el cuerpo y la mecha
    // El cuerpo va de open a close
    body: [d.open, d.close],
    // La mecha va de low a high
    wick: [d.low, d.high],
    color: d.close >= d.open ? '#10b981' : '#ef4444'
  }));

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
              formatter={(v: any, name) => {
                if (Array.isArray(v)) return [`O: ${v[0]} C: ${v[1]}`, 'Vela'];
                return [Number(v).toLocaleString(), name];
              }}
              itemStyle={{ fontSize: '10px', fontWeight: 'bold', padding: '2px 0' }}
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

            {/* Volume Bars at bottom (scaled down independently) */}
            <Bar 
              dataKey="volume" 
              fill="#1f2937" 
              opacity={0.2} 
              isAnimationActive={false} 
              name="Volumen"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
