import React from 'react';

interface MiniHistogramProps {
  data: { hist: number; color: string }[];
  width?: number;
  height?: number;
  barWidth?: number;
  gap?: number;
}

export const MiniHistogram: React.FC<MiniHistogramProps> = ({ 
  data, 
  width = 40, 
  height = 16, 
  barWidth = 2.5, 
  gap = 1 
}) => {
  if (!data || data.length === 0) return (
    <div className="w-[40px] h-[16px] bg-slate-900/50 rounded flex items-center justify-center">
      <div className="w-full h-[1px] bg-slate-800" />
    </div>
  );

  // Find max absolute value for scaling
  const maxVal = Math.max(...data.map(d => Math.abs(d.hist || 0)), 0.001);

  return (
    <div className="flex items-center px-1.5 py-1 rounded-md bg-black/20 border border-white/5 backdrop-blur-sm">
      <svg width={width} height={height} className="overflow-visible">
        {data.map((d, i) => {
          const val = d.hist || 0;
          const barHeight = (Math.abs(val) / maxVal) * (height / 2);
          const y = val >= 0 ? (height / 2) - barHeight : (height / 2);
          return (
            <rect
              key={i}
              x={i * (barWidth + gap)}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, 0.5)}
              fill={d.color || '#334155'}
              rx={0.5}
            />
          );
        })}
        {/* Baseline */}
        <line 
          x1={-1} y1={height / 2} x2={width + 1} y2={height / 2} 
          stroke="#475569" strokeWidth={0.5} strokeDasharray="1 1" 
          opacity={0.3}
        />
      </svg>
    </div>
  );
};
