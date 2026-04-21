import { useEffect, useRef } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { marketService } from '../services/marketService';

const INDICATOR_REFRESH_MS = 5000;

export const useMarketData = () => {
  const { selectedAsset, setCurrentPrice, refreshIndicators, fetchHistory } = useMarketStore();
  const latestPrice = useRef<number>(0);

  useEffect(() => {
    fetchHistory(selectedAsset.id);

    // WebSocket: updates price display on every trade (lightweight)
    const socket = marketService.subscribeToPrice(selectedAsset.id, (price) => {
      latestPrice.current = price;
      setCurrentPrice(price);
    });

    // Interval: recalculates all indicators every 5s using the latest price
    const indicatorTimer = setInterval(() => {
      if (latestPrice.current > 0) {
        refreshIndicators(latestPrice.current);
      }
    }, INDICATOR_REFRESH_MS);

    return () => {
      socket.close();
      clearInterval(indicatorTimer);
    };
  }, [selectedAsset, setCurrentPrice, refreshIndicators, fetchHistory]);
};
