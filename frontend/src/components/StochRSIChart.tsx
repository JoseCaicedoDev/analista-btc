import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine, Tooltip } from 'recharts';
import { useMarketStore } from '../store/useMarketStore';

interface StochRSIChartProps {
  data?: any[];
  title?: string;
  syncId?: string;
}

export const StochRSIChart: React.FC<StochRSIChartProps> = ({ data: propData, title, syncId }) => {
  const { history1h } = useMarketStore();
  
  // Limitar a los últimos 50 puntos para evitar saturación visual
  const data = (propData || history1h).slice(-50);

  return (
    <div className="w-full h-full min-h-0 flex flex-col group">
      {title && (
        <div className="flex justify-between items-center mb-2 shrink-0 px-1">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{title}</span>
          <div className="flex gap-3 text-[9px] font-bold">
            <span className="text-blue-500 text-[10px]">K</span>
            <span className="text-orange-500 text-[10px]">D</span>
          </div>
        </div>
      )}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} syncId={syncId}>
            <defs>
              <linearGradient id="colorK" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} opacity={0.2} />
            <XAxis dataKey="time" hide />
            <YAxis 
              domain={[0, 100]} 
              orientation="right" 
              tick={{ fontSize: 9, fill: '#6b7280', fontWeight: 'bold' }} 
              axisLine={false} 
              tickLine={false} 
              ticks={[20, 50, 80]}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#08090a', border: '1px solid #1f2937', borderRadius: '12px', fontSize: '10px' }}
              labelFormatter={(t) => new Date(Number(t) * 1000).toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              formatter={(v) => [Number(v).toFixed(1), undefined]}
              itemStyle={{ fontSize: '10px', fontWeight: 'bold', padding: '2px 0' }}
              cursor={{ stroke: '#38bdf8', strokeWidth: 1, strokeDasharray: '4 4' }}
            />

            <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" opacity={0.3} />
            <ReferenceLine y={20} stroke="#10b981" strokeDasharray="3 3" opacity={0.3} />

            {/* D Line (Orange) */}
            <Area
              type="monotone"
              dataKey="stochD"
              stroke="#f97316"
              strokeWidth={1.5}
              fill="transparent"
              dot={false}
              isAnimationActive={false}
              name="Stoch D"
            />
            {/* K Line (Blue) with Area Fill */}
            <Area
              type="monotone"
              dataKey="stochK"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorK)"
              dot={false}
              isAnimationActive={false}
              name="Stoch K"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
