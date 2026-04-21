import { create } from 'zustand';
import { type DataPoint, processIndicators } from '../domain/indicators';
import { marketService } from '../services/marketService';
import { ASSETS } from '../config/assets';

interface MarketState {
  availableAssets: typeof ASSETS;
  selectedAsset: (typeof ASSETS)[0];
  currentPrice: number;
  history1h: DataPoint[];
  history4h: DataPoint[];
  historyDaily: DataPoint[];
  historyWeekly: DataPoint[];
  alerts: any[];
  isAlarmActive: boolean;

  setSelectedAsset: (asset: (typeof ASSETS)[0]) => void;
  setCurrentPrice: (price: number) => void;
  fetchHistory: (ticker: string) => Promise<void>;
  addAlerts: (newAlerts: any[]) => void;
  addAlert: (alert: any) => void;
  setAlarmActive: (active: boolean) => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  availableAssets: ASSETS,
  selectedAsset: ASSETS[0],
  currentPrice: 0,
  history1h: [],
  history4h: [],
  historyDaily: [],
  historyWeekly: [],
  alerts: [],
  isAlarmActive: false,

  setSelectedAsset: (asset) => {
    set({ selectedAsset: asset, history1h: [], history4h: [], historyDaily: [], historyWeekly: [] });
    get().fetchHistory(asset.id);
  },

  setCurrentPrice: (price) => {
    const state = get();

    const updateRealtime = (history: DataPoint[]) => {
      if (history.length === 0) return history;
      const last = history[history.length - 1];
      const lastPoint: DataPoint = {
        ...last,
        price,
        close: price,
        high: Math.max(last.high ?? price, price),
        low: Math.min(last.low ?? price, price),
      };
      return processIndicators([...history.slice(0, -1), lastPoint]);
    };

    set({
      currentPrice: price,
      history1h: updateRealtime(state.history1h),
      history4h: updateRealtime(state.history4h),
      historyDaily: updateRealtime(state.historyDaily),
      historyWeekly: updateRealtime(state.historyWeekly),
    });
  },

  fetchHistory: async (ticker: string) => {
    try {
      const [h1, h4, daily, weekly] = await Promise.all([
        marketService.fetchHistory(ticker, '60d', '1h'),
        marketService.fetchHistory(ticker, '2y', '4h'),
        marketService.fetchHistory(ticker, 'max', '1d'),
        marketService.fetchHistory(ticker, 'max', '1wk'),
      ]);

      set({
        history1h: processIndicators(h1),
        history4h: processIndicators(h4),
        historyDaily: processIndicators(daily),
        historyWeekly: processIndicators(weekly),
      });
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  },

  addAlerts: (newAlerts) => set((state) => ({
    alerts: [...newAlerts, ...state.alerts].slice(0, 50),
  })),
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts].slice(0, 50),
  })),
  setAlarmActive: (active: boolean) => set({ isAlarmActive: active }),
}));
