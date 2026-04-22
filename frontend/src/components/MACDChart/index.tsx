import React from 'react';
import { ComposedChart, Bar, Line, ResponsiveContainer, Cell, XAxis, YAxis, Tooltip } from 'recharts';
import type { DataPoint } from '../../domain/indicators';

interface MACDChartProps {
  data: DataPoint[];
  title: string;
  positiveColor?: string;
  negativeColor?: string;
  syncId?: string;
}

export const MACDChart: React.FC<MACDChartProps> = ({
  data: propData,
  syncId,
}) => {
  // Limitar a los últimos 50 puntos
  const data = propData.slice(-50);

  return (
    <div className="w-full h-full min-h-0 flex flex-col group">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} syncId={syncId}>
            <XAxis dataKey="time" hide />
            <YAxis domain={['auto', 'auto']} hide />
            <Tooltip
              contentStyle={{ backgroundColor: '#08090a', border: '1px solid #1f2937', borderRadius: '12px', fontSize: '10px' }}
              labelFormatter={(t) => new Date(Number(t) * 1000).toLocaleTimeString()}
              formatter={(v) => [Number(v).toFixed(2), undefined]}
              itemStyle={{ fontSize: '10px', fontWeight: 'bold', padding: '2px 0' }}
              cursor={{ stroke: '#38bdf8', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Bar dataKey="hist" isAnimationActive={false}>
              {data.map((entry, index) => {
                const color = entry.histColor?.toLowerCase() || '';
                let fill = '#374151'; // Neutral default
                
                // Map trading colors
                if (color === '#26a69a' || color === 'green') fill = '#26a69a'; // Verde oscuro
                else if (color === '#b2dfdb' || color === 'lime') fill = '#b2dfdb'; // Verde claro
                else if (color === '#ff5252' || color === 'red') fill = '#ff5252'; // Rojo oscuro
                else if (color === '#ffcdd2' || color === 'maroon') fill = '#ffcdd2'; // Rojo claro
                
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={fill}
                  />
                );
              })}
            </Bar>
            <Line type="monotone" dataKey="macd" stroke="#3b82f6" strokeWidth={1.5} dot={false} isAnimationActive={false} name="MACD" />
            <Line type="monotone" dataKey="signal" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} name="Signal" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
