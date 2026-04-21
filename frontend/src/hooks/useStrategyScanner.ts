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
    _alarmAudio = new Audio('/alarma.mp3');
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
  hist: number | null;
  prevHist: number | null;      // previous histogram value (to know if bar is dark or light)
  histColor: string | null;     // actual TradingView-style bar color
  macd: number | null;
  signalLine: number | null;
  stochK: number | null;
  stochD: number | null;
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

        // ── Fetch 1H candles (last 60 days gives ~1440 candles, plenty for MACD)
        const history = await marketService.fetchHistory(asset.id, '60d', '1h');
        if (!history || history.length < 35) continue;

        const processed = processIndicators(history);
        const result = checkStrategy1H(processed);

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
          hist: null,
          prevHist: null,
          histColor: null,
          macd: null,
          signalLine: null,
          stochK: null,
          stochD: null,
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
