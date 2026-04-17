import React from 'react';
import { useMarketStore } from '../../store/useMarketStore';

const ASSETS = [
  { id: 'BTC-USD', symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { id: 'ETH-USD', symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { id: 'SOL-USD', symbol: 'SOL', name: 'Solana', color: '#14F195' }
];

export const AssetSelector: React.FC = () => {
  const { selectedAsset, setSelectedAsset } = useMarketStore();

  return (
    <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800">
      {ASSETS.map(asset => (
        <button
          key={asset.id}
          onClick={() => setSelectedAsset(asset)}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            selectedAsset.id === asset.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {asset.symbol}
        </button>
      ))}
    </div>
  );
};
