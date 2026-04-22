import React from 'react';
import { useMarketStore } from '../../store/useMarketStore';
import { Card } from '../shared/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const PriceMonitor: React.FC = () => {
  const { currentPrice, selectedAsset } = useMarketStore();
  
  return (
    <Card className="bg-gradient-to-br from-gray-900 to-black">
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            {selectedAsset.name} / USD
          </span>
          <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            <TrendingUp size={10} />
            <span className="text-[10px] font-bold">En Vivo</span>
          </div>
        </div>
        
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-white tracking-tighter">
            ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-bold text-gray-500">USD</span>
        </div>
      </div>
    </Card>
  );
};
