import { useEffect, useRef } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { marketService } from '../services/marketService';


export const useMarketData = () => {
  const { selectedAsset, setCurrentPrice, refreshIndicators, fetchHistory } = useMarketStore();
  const latestPrice = useRef<number>(0);

  useEffect(() => {
    fetchHistory(selectedAsset.id);

    // WebSocket: updates price display AND charts on every trade (miniTicker = 1/sec)
    const socket = marketService.subscribeToPrice(selectedAsset.id, (price) => {
      latestPrice.current = price;
      setCurrentPrice(price);
      refreshIndicators(price); // <--- Actualiza las gráficas en vivo
    });

    return () => {
      socket.close();
    };
  }, [selectedAsset, setCurrentPrice, refreshIndicators, fetchHistory]);
};
