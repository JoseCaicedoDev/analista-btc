import { useEffect, useRef, useCallback } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { marketService } from '../services/marketService';
import { processIndicators, checkStrategy1H } from '../domain/indicators';

// Intervalo de escaneo en ms (cada 60 segundos para 1H es suficiente)
const SCAN_INTERVAL_MS = 60_000;

// Utilidad para reproducir sonido usando Web Audio API
const playAlertSound = (type: 'LONG' | 'SHORT') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Tonos diferentes
    if (type === 'LONG') {
      // Ascendente (Compra)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1); // C6
    } else {
      // Descendente (Venta)
      osc.type = 'square';
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
      osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.1); // C5
    }
    
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio play failed", e);
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
  alert: boolean;
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
  const { availableAssets, addAlert } = useMarketStore();
  const lastChecked = useRef<Record<string, number>>({});
  const statusMap = useRef<Record<string, TokenScanStatus>>({});
  
  // Track last active signal string to avoid repeating alarms
  const lastAlertedSignal = useRef<Record<string, 'long' | 'short' | 'none'>>({});

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
          alert: result.signal !== 'none',
          lastScanned: time,
        };

        emitScanStatus({ ...statusMap.current });

        // ── Fire alert if strategy triggered and it's a NEW signal for this token
        const currentActiveSignal = lastAlertedSignal.current[asset.symbol] || 'none';
        
        if (result.signal !== 'none' && result.signal !== currentActiveSignal) {
          const type = result.signal.toUpperCase() as 'LONG' | 'SHORT';
          const lastPrice = history[history.length - 1].price;
          
          playAlertSound(type); // Play sound alarm
          
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
          alert: false,
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
