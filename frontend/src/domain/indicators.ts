export interface DataPoint {
  time: number;
  price: number;
  rsi?: number;
  hist?: number;
  macd?: number;
  signal?: number;
  histColor?: string;
}

export const calculateRSI = (prices: number[], period: number = 14): (number | null)[] => {
  if (prices.length <= period) return Array(prices.length).fill(null);
  
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  const rsiValues: (number | null)[] = Array(period).fill(null);

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const gain = diff >= 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsiValues.push(100 - 100 / (1 + rs));
  }
  return rsiValues;
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
  const { macdLine, signalLine, histogram, colors } = calculateMACD(prices);
  
  return history.map((d, i) => ({
    ...d,
    rsi: rsi[i] ?? undefined,
    macd: macdLine[i],
    signal: signalLine[i],
    hist: histogram[i],
    histColor: colors[i]
  }));
};

