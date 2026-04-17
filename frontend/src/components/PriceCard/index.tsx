import React from 'react';
import { useMarketStore } from '../../store/useMarketStore';

export const PriceCard: React.FC = () => {
  const { currentPrice, selectedAsset } = useMarketStore();

  return (
    <div className="glass-panel p-6 bg-slate-900 border-indigo-500/20 shadow-indigo-500/5">
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
        Precio Real ({selectedAsset.symbol})
      </p>
      <div className="flex items-baseline gap-2">
        <h2 className="text-4xl font-black text-white tracking-tighter">
          ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
      </div>
    </div>
  );
};
