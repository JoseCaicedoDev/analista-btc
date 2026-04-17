import { create } from 'zustand';
import { type DataPoint, processIndicators } from '../domain/indicators';
import { marketService } from '../services/marketService';

interface MarketState {
  selectedAsset: { id: string; symbol: string; name: string; color: string };
  currentPrice: number;
  history4h: DataPoint[];
  historyDaily: DataPoint[];
  historyWeekly: DataPoint[];
  alerts: any[];
  
  setSelectedAsset: (asset: any) => void;
  setCurrentPrice: (price: number) => void;
  fetchHistory: (ticker: string) => Promise<void>;
  addAlerts: (newAlerts: any[]) => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  selectedAsset: { id: 'BTC-USD', symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  currentPrice: 0,
  history4h: [],
  historyDaily: [],
  historyWeekly: [],
  alerts: [],

  setSelectedAsset: (asset) => {
    set({ selectedAsset: asset, history4h: [], historyDaily: [], historyWeekly: [] });
    get().fetchHistory(asset.id);
  },

  setCurrentPrice: (price) => {
    const state = get();
    
    // Función para actualizar el último precio en el historial y recalcular indicadores en tiempo real
    const updateRealtime = (history: DataPoint[]) => {
      if (history.length === 0) return history;
      const lastPoint = { ...history[history.length - 1], price };
      const newHistory = [...history.slice(0, -1), lastPoint];
      return processIndicators(newHistory);
    };

    set({ 
      currentPrice: price,
      history4h: updateRealtime(state.history4h),
      historyDaily: updateRealtime(state.historyDaily),
      historyWeekly: updateRealtime(state.historyWeekly)
    });
  },

  fetchHistory: async (ticker: string) => {
    try {
      const [h4, daily, weekly] = await Promise.all([
        marketService.fetchHistory(ticker, '5d', '1h'),
        marketService.fetchHistory(ticker, '1mo', '1d'),
        marketService.fetchHistory(ticker, '1y', '1wk')
      ]);

      set({ 
        history4h: processIndicators(h4), 
        historyDaily: processIndicators(daily), 
        historyWeekly: processIndicators(weekly) 
      });
    } catch (error) {
      console.error("Error fetching market data:", error);
    }
  },

  addAlerts: (newAlerts) => set((state) => ({ 
    alerts: [...newAlerts, ...state.alerts].slice(0, 10) 
  }))
}));
