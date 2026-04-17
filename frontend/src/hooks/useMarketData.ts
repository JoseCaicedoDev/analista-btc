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

export const useAlerts = () => {
  const { history4h, addAlerts } = useMarketStore();

  useEffect(() => {
    const socket = marketService.subscribeToAlerts((alerts) => {
      addAlerts(alerts);
    });

    // Periodically send data to evaluate alerts
    const interval = setInterval(() => {
      if (history4h.length > 0 && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(history4h));
      }
    }, 10000);

    return () => {
      socket.close();
      clearInterval(interval);
    };
  }, [history4h, addAlerts]);
};
