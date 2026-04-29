const BINANCE_REST = 'https://api.binance.com/api/v3';
const BINANCE_WS = 'wss://stream.binance.com:9443/ws';

// Map yfinance-style intervals to Binance intervals
const intervalMap: Record<string, string> = {
  '1h': '1h',
  '4h': '4h',
  '1d': '1d',
  '1wk': '1w',
};

const MARKET_API = `/api/market`;

export const marketService = {
  fetchHistory: async (ticker: string, _period: string, interval: string) => {
    const binanceInterval = intervalMap[interval] ?? interval;
    const url = `${BINANCE_REST}/klines?symbol=${ticker}&interval=${binanceInterval}&limit=1000`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Binance klines error: ${response.status}`);
    const raw: string[][] = await response.json();
    return raw.map((k) => ({
      time: Math.floor(Number(k[0]) / 1000),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      price: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));
  },

  subscribeToPrice: (ticker: string, onMessage: (price: number) => void) => {
    // @miniTicker fires once per second with the consolidated close price — smoother than @trade
    const stream = ticker.toLowerCase() + '@miniTicker';
    const socket = new WebSocket(`${BINANCE_WS}/${stream}`);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(parseFloat(data.c)); // 'c' = current close price
    };
    return socket;
  },

  fetchEtfs: async () => {
    const response = await fetch(`${MARKET_API}/etfs`);
    if (!response.ok) throw new Error(`Market API etfs error: ${response.status}`);
    return await response.json();
  },

  fetchEtfHistory: async (ticker: string, period: string, interval: string) => {
    const response = await fetch(`${MARKET_API}/${ticker}/history?period=${period}&interval=${interval}`);
    if (!response.ok) throw new Error(`Market API history error: ${response.status}`);
    const raw = await response.json();
    return raw.map((k: any) => ({
      ...k,
      time: Math.floor(k.time / 1000), // convert ms to s for indicators.ts
    }));
  },
};
