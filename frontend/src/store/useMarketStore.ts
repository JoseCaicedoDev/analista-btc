import { create } from 'zustand';
import { type DataPoint, processIndicators } from '../domain/indicators';
import { marketService } from '../services/marketService';

interface MarketState {
  availableAssets: any[];
  selectedAsset: { id: string; symbol: string; name: string; color: string };
  currentPrice: number;
  history4h: DataPoint[];
  historyDaily: DataPoint[];
  historyWeekly: DataPoint[];
  alerts: any[];
  
  fetchAssets: () => Promise<void>;
  setSelectedAsset: (asset: any) => void;
  setCurrentPrice: (price: number) => void;
  fetchHistory: (ticker: string) => Promise<void>;
  addAlerts: (newAlerts: any[]) => void;
  addAlert: (alert: any) => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  availableAssets: [],
  selectedAsset: { id: 'BTC-USD', symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  currentPrice: 0,
  history4h: [],
  historyDaily: [],
  historyWeekly: [],
  alerts: [],
  
  fetchAssets: async () => {
    try {
      const assets = await marketService.fetchAssets();
      if (assets && assets.length > 0) {
        set({ availableAssets: assets });
        // Optionally set the first asset as default if not already set or if it's the beginning
        if (get().history4h.length === 0) {
          get().setSelectedAsset(assets[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  },

  setSelectedAsset: (asset) => {
    set({ selectedAsset: asset, history4h: [], historyDaily: [], historyWeekly: [] });
    get().fetchHistory(asset.id);
  },

  setCurrentPrice: (price) => {
    const state = get();
    
    // Función para actualizar el último precio en el historial y recalcular indicadores en tiempo real
    const updateRealtime = (history: DataPoint[]) => {
      if (history.length === 0) return history;
      const last = history[history.length - 1];
      const lastPoint: DataPoint = { 
        ...last, 
        price,
        close: price,
        high: Math.max(last.high ?? price, price),
        low: Math.min(last.low ?? price, price)
      };
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
        marketService.fetchHistory(ticker, '2y', '4h'),
        marketService.fetchHistory(ticker, 'max', '1d'),
        marketService.fetchHistory(ticker, 'max', '1wk')
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
    alerts: [...newAlerts, ...state.alerts].slice(0, 50) 
  })),
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts].slice(0, 50)
  }))
}));
