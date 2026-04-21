import { useEffect } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { marketService } from '../services/marketService';

export const useMarketData = () => {
  const { selectedAsset, setCurrentPrice, fetchHistory } = useMarketStore();

  useEffect(() => {
    fetchHistory(selectedAsset.id);

    const socket = marketService.subscribeToPrice(selectedAsset.id, (price) => {
      setCurrentPrice(price);
    });

    return () => socket.close();
  }, [selectedAsset, setCurrentPrice, fetchHistory]);
};
