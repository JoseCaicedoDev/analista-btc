import axios from 'axios';

const MARKET_API = '/api';
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_PRICE_URL = `${wsProtocol}//${window.location.host}/ws/price`;
const WS_ALERTS_URL = `${wsProtocol}//${window.location.host}/ws/alerts`;

export const marketService = {
  fetchHistory: async (ticker: string, period: string, interval: string) => {
    const response = await axios.get(`${MARKET_API}/market/${ticker}/history`, {
      params: { period, interval }
    });
    return response.data;
  },
  
  fetchAssets: async () => {
    const response = await axios.get(`${MARKET_API}/market/assets`);
    return response.data;
  },

  subscribeToPrice: (ticker: string, onMessage: (price: number) => void) => {
    const socket = new WebSocket(`${WS_PRICE_URL}/${ticker}`);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data.price);
    };
    return socket;
  },

  subscribeToAlerts: (onAlerts: (alerts: any[]) => void) => {
    const socket = new WebSocket(WS_ALERTS_URL);
    socket.onmessage = (event) => {
      const alerts = JSON.parse(event.data);
      onAlerts(alerts);
    };
    return socket;
  }
};
