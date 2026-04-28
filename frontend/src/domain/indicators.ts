export interface DataPoint {
  time: number;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  rsi?: number;
  rsiMA?: number;
  hist?: number;
  macd?: number;
  signal?: number;
  histColor?: string;
  ema200?: number;
  stochK?: number;
  stochD?: number;
  volume?: number;
  volEma?: number;
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

export const calculateEMA = (data: number[], period: number): (number | null)[] => {
  if (!data || data.length === 0) return [];
  const k = 2 / (period + 1);
  const ema: (number | null)[] = [];
  
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sum += data[i];
      ema.push(null);
    } else if (i === period - 1) {
      sum += data[i];
      ema.push(sum / period);
    } else {
      const prevEma = ema[i - 1];
      if (prevEma === null) {
        ema.push(null);
      } else {
        ema.push(data[i] * k + prevEma * (1 - k));
      }
    }
  }
  return ema;
};

export const calculateRMA = (data: number[], period: number): (number | null)[] => {
  if (!data || data.length === 0) return [];
  const alpha = 1 / period;
  const rma: (number | null)[] = [];
  
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sum += data[i];
      rma.push(null);
    } else if (i === period - 1) {
      sum += data[i];
      rma.push(sum / period);
    } else {
      const prevRma = rma[i - 1];
      if (prevRma === null) {
        rma.push(null);
      } else {
        rma.push(alpha * data[i] + (1 - alpha) * prevRma);
      }
    }
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
    
    if (up === null || down === null) {
      rsiValues.push(null);
    } else if (down === 0) {
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
  const macdLine = ema12.map((val, i) => {
    const v12 = val;
    const v26 = ema26[i];
    return (v12 !== null && v26 !== null) ? v12 - v26 : null;
  });

  // Filter out nulls for signal EMA calculation to avoid internal lag issues, 
  // but keep alignment by passing the whole array and handling nulls inside EMA
  const macdLineNumbers = macdLine.map(v => v ?? 0); 
  const signalLine = calculateEMA(macdLineNumbers, 9);
  
  // Re-apply nulls to signal line where MACD was null
  const alignedSignal = signalLine.map((v, i) => macdLine[i] === null ? null : v);

  const histogram = macdLine.map((val, i) => {
    const sig = alignedSignal[i];
    return (val !== null && sig !== null) ? val - sig : null;
  });
  
  const colors = histogram.map((h, i) => {
    if (h === null) return "transparent";
    if (i === 0) return "#26a69a";
    const prevH = histogram[i-1];
    if (prevH === null) return "#26a69a";
    
    if (h >= 0) {
      return h > prevH ? "#26a69a" : "#b2dfdb";
    } else {
      return h > prevH ? "#ffcdd2" : "#ff5252";
    }
  });

  return { macdLine, signalLine: alignedSignal, histogram, colors };
};

export const calculateStochRSI = (rsi: (number | null)[], lengthStoch: number, smoothK: number, smoothD: number) => {
  const stochRsiLine = rsi.map((val, i) => {
    if (i < lengthStoch - 1) return null;
    const window = rsi.slice(i - lengthStoch + 1, i + 1);
    const validWindow = window.filter((v): v is number => v !== null);
    if (validWindow.length < lengthStoch) return null;
    const lowest = Math.min(...validWindow);
    const highest = Math.max(...validWindow);
    if (highest === lowest) return 0;
    return 100 * (val! - lowest) / (highest - lowest);
  });
  const kLine = calculateSMA(stochRsiLine, smoothK);
  const dLine = calculateSMA(kLine, smoothD);
  return { kLine, dLine };
};

export const processIndicators = (history: DataPoint[]): DataPoint[] => {
  const prices = history.map(d => d.price);
  const volumes = history.map(d => d.volume ?? 0);
  if (prices.length < 2) return history;
  
  const rsi = calculateRSI(prices);
  const rsiMA = calculateSMA(rsi, 14);
  const { macdLine, signalLine, histogram, colors } = calculateMACD(prices);
  const ema200 = calculateEMA(prices, 200);
  const { kLine, dLine } = calculateStochRSI(rsi, 14, 3, 3);
  const volEma = calculateEMA(volumes, 20);
  
  return history.map((d, i) => ({
    ...d,
    rsi: rsi[i] ?? undefined,
    rsiMA: rsiMA[i] ?? undefined,
    macd: macdLine[i] ?? undefined,
    signal: signalLine[i] ?? undefined,
    hist: histogram[i] ?? undefined,
    histColor: colors[i],
    ema200: ema200[i] ?? undefined,
    stochK: kLine[i] ?? undefined,
    stochD: dLine[i] ?? undefined,
    volEma: volEma[i] ?? undefined
  }));
};
export const calculateRSIDivergence = (history: DataPoint[]) => {
  if (history.length < 50) return { type: 'none', value: 0 };
  
  const len = history.length;
  const pivotPeriod = 5;

  const isPivotHigh = (index: number) => {
    if (index < pivotPeriod || index > len - 1 - pivotPeriod) return false;
    const val = history[index].high ?? history[index].price;
    for (let i = 1; i <= pivotPeriod; i++) {
        const prev = history[index - i].high ?? history[index - i].price;
        const next = history[index + i].high ?? history[index + i].price;
        if (val <= prev || val <= next) return false;
    }
    return true;
  };

  const isPivotLow = (index: number) => {
    if (index < pivotPeriod || index > len - 1 - pivotPeriod) return false;
    const val = history[index].low ?? history[index].price;
    for (let i = 1; i <= pivotPeriod; i++) {
        const prev = history[index - i].low ?? history[index - i].price;
        const next = history[index + i].low ?? history[index + i].price;
        if (val >= prev || val >= next) return false;
    }
    return true;
  };

  let lastPivotHighIdx = -1;
  let prevPivotHighIdx = -1;
  
  for (let i = len - 1 - pivotPeriod; i >= pivotPeriod; i--) {
    if (isPivotHigh(i)) {
      if (lastPivotHighIdx === -1) {
        lastPivotHighIdx = i;
      } else if (prevPivotHighIdx === -1) {
        prevPivotHighIdx = i;
        break;
      }
    }
  }

  let lastPivotLowIdx = -1;
  let prevPivotLowIdx = -1;

  for (let i = len - 1 - pivotPeriod; i >= pivotPeriod; i--) {
    if (isPivotLow(i)) {
      if (lastPivotLowIdx === -1) {
        lastPivotLowIdx = i;
      } else if (prevPivotLowIdx === -1) {
        prevPivotLowIdx = i;
        break;
      }
    }
  }

  if (lastPivotHighIdx !== -1 && prevPivotHighIdx !== -1) {
    const curPrice = history[lastPivotHighIdx].high ?? history[lastPivotHighIdx].price;
    const prevPrice = history[prevPivotHighIdx].high ?? history[prevPivotHighIdx].price;
    
    if (curPrice > prevPrice) {
      const curRSI = history[lastPivotHighIdx].rsi ?? 50;
      const prevRSI = history[prevPivotHighIdx].rsi ?? 50;
      const curVolEma = history[lastPivotHighIdx].volEma ?? 0;
      const prevVolEma = history[prevPivotHighIdx].volEma ?? 0;
      
      if (curRSI < prevRSI) {
        return { type: 'bearish', value: curRSI };
      }
      if (curVolEma < prevVolEma) {
        return { type: 'bearish_vol', value: curRSI };
      }
    }
  }

  if (lastPivotLowIdx !== -1 && prevPivotLowIdx !== -1) {
    const curPrice = history[lastPivotLowIdx].low ?? history[lastPivotLowIdx].price;
    const prevPrice = history[prevPivotLowIdx].low ?? history[prevPivotLowIdx].price;
    
    if (curPrice < prevPrice) {
      const curRSI = history[lastPivotLowIdx].rsi ?? 50;
      const prevRSI = history[prevPivotLowIdx].rsi ?? 50;
      
      if (curRSI > prevRSI) {
        return { type: 'bullish', value: curRSI };
      }
    }
  }

  return { type: 'none', value: history[len - 1]?.rsi ?? 50 };
};

export interface StrategyResult {
  signal: 'long' | 'short' | 'neutral' | 'none';
  reason: string;
  rsi?: number;
  hist?: number;
  macd?: number;
  signalLine?: number;
  stochK?: number;
  stochD?: number;
}

/**
 * Estrategia 1H – Escáner de 3 señales
 * LONG (COMPRA): RSI < 30 (Rojo) + MACD Hist < 0 (Rojo) + StochRSI K y D < 20 (Rojo)
 * SHORT (VENTA): RSI > 70 (Verde) + MACD Hist > 0 (Verde) + StochRSI K y D > 80 (Verde)
 */
export const checkStrategy1H = (history: DataPoint[]): StrategyResult => {
  if (history.length < 35) return { signal: 'none', reason: '' };

  const last = history[history.length - 1];

  const rsi = last.rsi;
  const hist = last.hist;
  const stochK = last.stochK;
  const stochD = last.stochD;

  // All indicators must be available
  if (
    rsi === undefined || rsi === null ||
    hist === undefined || hist === null ||
    stochK === undefined || stochK === null ||
    stochD === undefined || stochD === null
  ) {
    return { signal: 'none', reason: '' };
  }

  // Conditions for LONG (COMPRA) - All 3 badges RED
  const rsiRed = rsi < 30;
  const histRed = hist < 0;
  const stochRed = stochK < 20 && stochD < 20;

  if (rsiRed && histRed && stochRed) {
    return {
      signal: 'long',
      reason: `COMPRA FUERTE: RSI Sobreventa, MACD bajista y StochRSI < 20`,
      rsi,
      hist,
      stochK,
      stochD,
    };
  }

  // Conditions for SHORT (VENTA) - All 3 badges GREEN
  const rsiGreen = rsi > 70;
  const histGreen = hist > 0;
  const stochGreen = stochK > 80 && stochD > 80;

  if (rsiGreen && histGreen && stochGreen) {
    return {
      signal: 'short',
      reason: `VENTA FUERTE: RSI Sobrecompra, MACD alcista y StochRSI > 80`,
      rsi,
      hist,
      stochK,
      stochD,
    };
  }

  // Conditions for NEUTRAL - 2 indicators are RED
  const redCount = (rsiRed ? 1 : 0) + (histRed ? 1 : 0) + (stochRed ? 1 : 0);
  if (redCount === 2) {
    return {
      signal: 'neutral',
      reason: `ALERTA NEUTRAL: 2 de 3 indicadores en ROJO (Vigilancia)`,
      rsi,
      hist,
      stochK,
      stochD,
    };
  }

  return { signal: 'none', reason: '', rsi, hist, stochK, stochD };
};

export const checkStrategy4H = (history: DataPoint[]) => {
  if (history.length < 200) return { signal: 'none', reason: '' };
  
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  
  if (!last.ema200 || !last.macd || !last.signal || !prev.macd || !prev.signal) return { signal: 'none', reason: '' };

  const priceAboveEma = (last.price > last.ema200);
  const macdBelowZero = (last.macd < 0 && last.signal < 0);
  const macdAboveZero = (last.macd > 0 && last.signal > 0);
  
  // 1. LONG SIGNAL
  // Trigger: MACD Line crosses ABOVE Signal Line below zero
  const macdCrossUp = prev.macd < prev.signal && last.macd > last.signal;
  // Extra Confirmation: Histogram dark red to light red
  // We infer color from current and previous histogram values
  const lastHist = last.hist ?? 0;
  const prevHist = prev.hist ?? 0;
  const histLosingBearishStrength = lastHist > prevHist && lastHist < 0;

  if (priceAboveEma && macdBelowZero && macdCrossUp && histLosingBearishStrength) {
    return { signal: 'long', reason: 'EMA 200 Trend + MACD Cross Up below zero' };
  }

  // 2. SHORT SIGNAL
  // Trigger: MACD Line crosses BELOW Signal Line above zero
  const macdCrossDown = prev.macd > prev.signal && last.macd < last.signal;
  // Extra Confirmation: Histogram dark green to light green
  const histLosingBullishStrength = lastHist < prevHist && lastHist > 0;

  if (!priceAboveEma && macdAboveZero && macdCrossDown && histLosingBullishStrength) {
    return { signal: 'short', reason: 'Below EMA 200 + MACD Cross Down above zero' };
  }

  return { signal: 'none', reason: '' };
};
