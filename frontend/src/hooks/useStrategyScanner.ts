import { useEffect, useRef, useCallback } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { marketService } from '../services/marketService';
import { processIndicators, checkStrategy1H } from '../domain/indicators';

// Intervalo de escaneo en ms (cada 60 segundos para 1H es suficiente)
const SCAN_INTERVAL_MS = 60_000;

// Utilidad para reproducir sonido usando Web Audio API
// Utilidad para reproducir sonido usando Web Audio API
let _alarmAudio: HTMLAudioElement | null = null;

const playAlarm = () => {
  if (!_alarmAudio) {
    _alarmAudio = new Audio(import.meta.env.BASE_URL + 'alarma.mp3');
    _alarmAudio.loop = true;
  }
  _alarmAudio.play().catch(e => console.error("Audio play failed", e));
};

const stopAlarm = () => {
  if (_alarmAudio) {
    _alarmAudio.pause();
    _alarmAudio.currentTime = 0;
  }
};

// We re-export this type so AlertPanel can consume it
export type TokenScanStatus = {
  symbol: string;
  name: string;
  color: string;
  rsi: number | null;
  rsiDaily: number | null;
  rsiDailySlope: '+' | '-' | '0';
  hist: number | null;
  macdHistColorDaily: string | null;
  macdDailySlope: '+' | '-' | '0';
  prevHist: number | null;      // previous histogram value (to know if bar is dark or light)
  histColor: string | null;     // actual TradingView-style bar color
  macd: number | null;
  signalLine: number | null;
  stochK: number | null;
  stochD: number | null;
  stochCross: 'up' | 'down' | null;
  alert: boolean;
  alertType: 'long' | 'short' | 'neutral' | 'none';
  lastScanned: string;
};

// Shared atom-like ref to expose current scan statuses to other components
// (avoids extra Zustand store complexity)
let _scanStatusListeners: Array<(s: Record<string, TokenScanStatus>) => void> = [];
let _scanStatusMap: Record<string, TokenScanStatus> = {};

export const subscribeScanStatus = (
  cb: (s: Record<string, TokenScanStatus>) => void
) => {
  _scanStatusListeners.push(cb);
  cb(_scanStatusMap); // emit current state immediately
  return () => {
    _scanStatusListeners = _scanStatusListeners.filter((l) => l !== cb);
  };
};

const emitScanStatus = (map: Record<string, TokenScanStatus>) => {
  _scanStatusMap = map;
  _scanStatusListeners.forEach((l) => l(map));
};

// ─────────────────────────────────────────────────────────────────
export const useStrategyScanner = () => {
  const { availableAssets, addAlert, isAlarmActive, setAlarmActive } = useMarketStore();
  const lastChecked = useRef<Record<string, number>>({});
  const statusMap = useRef<Record<string, TokenScanStatus>>({});
  
  // Track last active signal string to avoid repeating alarms
  const lastAlertedSignal = useRef<Record<string, 'long' | 'short' | 'neutral' | 'none'>>({});
  const alarmTypeRef = useRef<'LONG' | 'SHORT' | 'NEUTRAL'>('LONG');

  // Alarm loop effect
  useEffect(() => {
    if (isAlarmActive) {
      playAlarm();
    } else {
      stopAlarm();
    }
  }, [isAlarmActive]);

  const scanAll = useCallback(async () => {
    if (availableAssets.length === 0) return;

    for (const asset of availableAssets) {
      try {
        const now = Date.now();

        // Throttle: once per 60 s per asset
        if (
          lastChecked.current[asset.symbol] &&
          now - lastChecked.current[asset.symbol] < SCAN_INTERVAL_MS
        ) {
          continue;
        }

        // ── Fetch 1H and Daily candles
        const [history, historyDaily] = await Promise.all([
          marketService.fetchHistory(asset.id, '60d', '1h'),
          marketService.fetchHistory(asset.id, 'max', '1d')
        ]);

        if (!history || history.length < 35) continue;

        const processed = processIndicators(history);
        const processedDaily = historyDaily ? processIndicators(historyDaily) : [];
        
        const result = checkStrategy1H(processed);
        const rsiDaily = processedDaily.length > 0 ? processedDaily[processedDaily.length - 1].rsi : null;
        
        // Calculate RSI Daily Slope (last 3 candles)
        let rsiDailySlope: '+' | '-' | '0' = '0';
        if (processedDaily.length >= 3) {
          const currentRSI = processedDaily[processedDaily.length - 1].rsi;
          const prevRSI = processedDaily[processedDaily.length - 3].rsi;
          if (currentRSI > prevRSI) rsiDailySlope = '+';
          else if (currentRSI < prevRSI) rsiDailySlope = '-';
        }

        const macdHistColorDaily = processedDaily.length > 0 ? processedDaily[processedDaily.length - 1].histColor : null;
        
        // Calculate MACD Daily Slope (last 3 candles) - Using Blue Line (MACD)
        let macdDailySlope: '+' | '-' | '0' = '0';
        if (processedDaily.length >= 3) {
          const currentMACD = processedDaily[processedDaily.length - 1].macd;
          const prevMACD = processedDaily[processedDaily.length - 3].macd;
          if (currentMACD > prevMACD) macdDailySlope = '+';
          else if (currentMACD < prevMACD) macdDailySlope = '-';
        }

        // Detect Stochastic Cross in 1H (last 2 pairs of candles)
        let stochCross: 'up' | 'down' | null = null;
        if (processed.length >= 3) {
          for (let i = processed.length - 1; i >= processed.length - 2; i--) {
            const curr = processed[i];
            const prev = processed[i-1];
            if (prev.stochK! <= prev.stochD! && curr.stochK! > curr.stochD!) {
              stochCross = 'up';
              break;
            }
            if (prev.stochK! >= prev.stochD! && curr.stochK! < curr.stochD!) {
              stochCross = 'down';
              break;
            }
          }
        }

        const time = new Date().toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
        });

        // ── Grab histogram color and prevHist from processed data
        const lastPoint = processed[processed.length - 1];
        const prevPoint = processed[processed.length - 2];

        // ── Update live scan status (used by AlertPanel token grid)
        statusMap.current[asset.symbol] = {
          symbol: asset.symbol,
          name: asset.name,
          color: asset.color,
          rsi: result.rsi ?? null,
          rsiDaily: rsiDaily ?? null,
          rsiDailySlope,
          macdHistColorDaily: macdHistColorDaily ?? null,
          macdDailySlope,
          stochK: result.stochK ?? null,
          stochD: result.stochD ?? null,
          stochCross,
          hist: lastPoint?.hist ?? null,
          prevHist: prevPoint?.hist ?? null,
          histColor: lastPoint?.histColor ?? null,
          macd: result.macd ?? null,
          signalLine: result.signalLine ?? null,
          stochK: result.stochK ?? null,
          stochD: result.stochD ?? null,
          alert: result.signal !== 'none',
          alertType: result.signal,
          lastScanned: time,
        };

        emitScanStatus({ ...statusMap.current });

        // ── Fire alert if strategy triggered and it's a NEW signal for this token
        const currentActiveSignal = lastAlertedSignal.current[asset.symbol] || 'none';
        
        if (result.signal !== 'none' && result.signal !== currentActiveSignal) {
          const type = result.signal.toUpperCase() as 'LONG' | 'SHORT' | 'NEUTRAL';
          const lastPrice = history[history.length - 1].price;
          
          alarmTypeRef.current = type;
          setAlarmActive(true);
          
          addAlert({
            id: `${asset.symbol}-${now}`,
            symbol: asset.symbol,
            name: asset.name,
            color: asset.color,
            type,
            price: lastPrice,
            time,
            message: result.reason,
            timeframe: '1H',
            rsi: result.rsi,
            hist: result.hist,
            stochK: result.stochK,
            stochD: result.stochD,
          });
        }
        
        // Update the tracked signal
        lastAlertedSignal.current[asset.symbol] = result.signal;

        lastChecked.current[asset.symbol] = now;
      } catch (err) {
        console.error(`[Scanner] Error scanning ${asset.symbol}:`, err);
      }
    }
  }, [availableAssets, addAlert]);

  useEffect(() => {
    if (availableAssets.length === 0) return;

    // ── Populate status map with placeholder entries immediately
    const placeholders: Record<string, TokenScanStatus> = {};
    for (const asset of availableAssets) {
      if (!statusMap.current[asset.symbol]) {
        placeholders[asset.symbol] = {
          symbol: asset.symbol,
          name: asset.name,
          color: asset.color,
          rsi: null,
          rsiDaily: null,
          rsiDailySlope: '0',
          macdHistColorDaily: null,
          macdDailySlope: '0',
          hist: null,
          prevHist: null,
          histColor: null,
          macd: null,
          signalLine: null,
          stochK: null,
          stochD: null,
          stochCross: null,
          alert: false,
          alertType: 'none',
          lastScanned: '--:--',
        };
      }
    }
    statusMap.current = { ...placeholders, ...statusMap.current };
    emitScanStatus({ ...statusMap.current });

    scanAll();
    const interval = setInterval(scanAll, SCAN_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [availableAssets, scanAll]);
};
