import React from 'react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Bar, ComposedChart, Cell, Line } from 'recharts';
import { calculateRSIDivergence } from '../../domain/indicators';
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
      // Usamos el rango completo para que el 'shape' tenga toda la información vertical
      fullRange: [d.low ?? 0, d.high ?? 0],
      color: (d.close ?? 0) >= (d.open ?? 0) ? '#10b981' : '#ef4444',
      divLine: (isP1 || isP2) ? (isP1 ? div.p1?.price : div.p2?.price) : null
    };
  });

  const divColor = div.type === 'bullish' ? '#10b981' : (div.type === 'bearish' ? '#f43f5e' : '#f59e0b');

  // Componente de forma personalizada para la vela
  const CandleShape = (props: any) => {
    const { x, y, width, height, payload } = props;
    const { open, close, high, low, color } = payload;
    
    if (high === undefined || low === undefined || open === undefined || close === undefined) return null;

    // Calcular posiciones relativas para el cuerpo dentro del rango high-low
    const range = high - low;
    if (range <= 0) {
      // Si no hay rango (vela plana), dibujamos una línea horizontal
      return <line x1={x} y1={y} x2={x + width} y2={y} stroke={color} strokeWidth={2} />;
    }

    const bodyTop = Math.max(open, close);
    const bodyBottom = Math.min(open, close);
    
    const yBodyTop = y + ((high - bodyTop) / range) * height;
    const yBodyBottom = y + ((high - bodyBottom) / range) * height;
    const bodyHeight = Math.max(yBodyBottom - yBodyTop, 1); // Al menos 1px de cuerpo

    return (
      <g>
        {/* Mecha (Wick) */}
        <line 
          x1={x + width / 2} 
          y1={y} 
          x2={x + width / 2} 
          y2={y + height} 
          stroke={color} 
          strokeWidth={1} 
        />
        {/* Cuerpo (Body) */}
        <rect 
          x={x} 
          y={yBodyTop} 
          width={width} 
          height={bodyHeight} 
          fill={color} 
        />
      </g>
    );
  };

  return (
    <div className="w-full h-full min-h-0 flex flex-col group">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} syncId={syncId} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
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
              formatter={(_v: any, _name, props) => {
                const d = props.payload;
                return [
                  <div className="flex flex-col gap-1 text-gray-200" key="ohlc">
                    <div className="flex justify-between gap-4"><span>O:</span> <span className="text-white font-mono">{d.open?.toFixed(2)}</span></div>
                    <div className="flex justify-between gap-4"><span>H:</span> <span className="text-white font-mono">{d.high?.toFixed(2)}</span></div>
                    <div className="flex justify-between gap-4"><span>L:</span> <span className="text-white font-mono">{d.low?.toFixed(2)}</span></div>
                    <div className="flex justify-between gap-4"><span>C:</span> <span className="text-white font-mono">{d.close?.toFixed(2)}</span></div>
                  </div>,
                  null
                ];
              }}
              itemStyle={{ color: '#f3f4f6', fontSize: '10px', fontWeight: 'bold' }}
              cursor={{ stroke: '#38bdf8', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            
            {/* Velas Japonesas (Cuerpo + Mecha en un solo componente para alineación perfecta) */}
            <Bar 
              dataKey="fullRange" 
              isAnimationActive={false} 
              barSize={8}
              shape={<CandleShape />}
            />

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
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
