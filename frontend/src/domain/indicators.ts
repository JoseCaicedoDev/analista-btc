export interface DataPoint {
  time: number;
  price: number;
  rsi?: number;
  rsiMA?: number;
  hist?: number;
  macd?: number;
  signal?: number;
  histColor?: string;
}

export const calculateSMA = (data: (number | undefined | null)[], period: number): (number | null)[] => {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    const window = data.slice(Math.max(0, i - period + 1), i + 1);
    const validValues = window.filter((v): v is number => v !== null && v !== undefined);
    if (validValues.length < period) {
      result.push(null);
    } else {
      const sum = validValues.reduce((acc, val) => acc + val, 0);
      result.push(sum / period);
    }
  }
  return result;
};

export const calculateEMA = (data: number[], period: number): number[] => {
  if (!data || data.length === 0) return [];
  const k = 2 / (period + 1);
  const ema = [data[0]];
  for (let i = 1; i < data.length; i++) {
    ema.push(data[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
};

export const calculateRMA = (data: number[], period: number): number[] => {
  if (!data || data.length === 0) return [];
  const alpha = 1 / period;
  const rma = [data[0]];
  for (let i = 1; i < data.length; i++) {
    rma.push(alpha * data[i] + (1 - alpha) * rma[i - 1]);
  }
  return rma;
};

export const calculateRSI = (prices: number[], period: number = 14): (number | null)[] => {
  if (prices.length <= period) return Array(prices.length).fill(null);
  
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  const ups = changes.map(c => Math.max(c, 0));
  const downs = changes.map(c => Math.max(-c, 0));

  const rmaUp = calculateRMA(ups, period);
  const rmaDown = calculateRMA(downs, period);

  const rsiValues: (number | null)[] = [null]; // First point has no change
  for (let i = 0; i < rmaUp.length; i++) {
    const up = rmaUp[i];
    const down = rmaDown[i];
    
    if (down === 0) {
      rsiValues.push(100);
    } else if (up === 0) {
      rsiValues.push(0);
    } else {
      const rs = up / down;
      rsiValues.push(100 - (100 / (1 + rs)));
    }
  }

  return rsiValues;
};


export const calculateMACD = (data: number[]) => {
  if (data.length < 26) return { macdLine: [], signalLine: [], histogram: [], colors: [] };
  
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macdLine = ema12.map((val, i) => val - ema26[i]);
  const signalLine = calculateEMA(macdLine, 9);
  const histogram = macdLine.map((val, i) => val - (signalLine[i] || 0));
  
  // Pine Script v6 Color Logic
  const colors = histogram.map((h, i) => {
    if (i === 0) return "#26a69a";
    const prevH = histogram[i-1];
    if (h >= 0) {
      return h > prevH ? "#26a69a" : "#b2dfdb";
    } else {
      return h > prevH ? "#ffcdd2" : "#ff5252";
    }
  });

  return { macdLine, signalLine, histogram, colors };
};

export const processIndicators = (history: DataPoint[]): DataPoint[] => {
  const prices = history.map(d => d.price);
  if (prices.length < 2) return history;
  
  const rsi = calculateRSI(prices);
  const rsiMA = calculateSMA(rsi, 14); // Smoothing MA from RSI.txt
  const { macdLine, signalLine, histogram, colors } = calculateMACD(prices);
  
  return history.map((d, i) => ({
    ...d,
    rsi: rsi[i] ?? undefined,
    rsiMA: rsiMA[i] ?? undefined,
    macd: macdLine[i],
    signal: signalLine[i],
    hist: histogram[i],
    histColor: colors[i]
  }));
};


