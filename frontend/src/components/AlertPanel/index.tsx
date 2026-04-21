import React, { useEffect, useState } from 'react';
import { Bell, TrendingUp, TrendingDown, Activity, Zap, Clock } from 'lucide-react';
import { useMarketStore } from '../../store/useMarketStore';
import { subscribeScanStatus, type TokenScanStatus } from '../../hooks/useStrategyScanner';

// ──────────────────────────────────────────────────────────────
// RSI zone helpers
const rsiZone = (value: number | null) => {
  if (value === null) return 'neutral';
  if (value < 30) return 'oversold';
  if (value > 70) return 'overbought';
  return 'neutral';
};

const rsiStyles = {
  oversold:   { badge: 'text-red-300 bg-red-500/20 border-red-500/50',     value: '#ef4444' },
  overbought: { badge: 'text-green-300 bg-green-500/20 border-green-500/50', value: '#22c55e' },
  neutral:    { badge: 'text-yellow-300 bg-yellow-500/15 border-yellow-500/30', value: '#facc15' },
};

// RSI value with zone color
const RsiValue: React.FC<{ value: number | null }> = ({ value }) => {
  if (value === null) return <span className="text-slate-600 text-xs font-mono">—</span>;
  const zone = rsiZone(value);
  return (
    <span style={{ color: rsiStyles[zone].value }} className="text-sm font-black font-mono">
      {value.toFixed(1)}
    </span>
  );
};

// Map TradingView histogram colors to human-readable badge styles
const histBadgeStyle = (histColor: string | null, hist: number | null) => {
  if (hist === null || histColor === null) {
    return { bg: 'bg-slate-800/60', border: 'border-slate-700/50', text: 'text-slate-400', label: '⚪ MACD neu' };
  }
  switch (histColor) {
    case '#ff5252': return { bg: 'bg-red-900/40',  border: 'border-red-600/50',  text: 'text-red-300',  label: '🔴 Rojo oscuro ↓' };
    case '#ffcdd2': return { bg: 'bg-red-900/20',  border: 'border-red-400/30',  text: 'text-red-200',  label: '🔴 Rojo claro ↑' };
    case '#26a69a': return { bg: 'bg-teal-900/40', border: 'border-teal-500/50', text: 'text-teal-300', label: '🟢 Verde oscuro ↑' };
    case '#b2dfdb': return { bg: 'bg-teal-900/20', border: 'border-teal-400/30', text: 'text-teal-200', label: '🟢 Verde claro ↓' };
    default:        return { bg: 'bg-slate-800/60', border: 'border-slate-700/50', text: 'text-slate-400', label: '⚪ MACD' };
  }
};

// ──────────────────────────────────────────────────────────────
// Single token card
const TokenStatusCard: React.FC<{ status: TokenScanStatus }> = ({ status }) => {
  const isAlert = status.alert;

  // Badge 1: MACD histogram actual color (dark/light red or green like TradingView)
  const hStyle = histBadgeStyle(status.histColor, status.hist);

  return (
    <div
      className={`relative rounded-xl border p-4 overflow-hidden transition-all duration-500 ${
        status.alertType === 'long'
          ? 'border-green-500/60 bg-green-950/20 shadow-lg shadow-green-500/10'
          : status.alertType === 'short'
          ? 'border-red-500/60 bg-red-950/20 shadow-lg shadow-red-500/10'
          : status.alertType === 'neutral'
          ? 'border-yellow-500/60 bg-yellow-950/20 shadow-lg shadow-yellow-500/10'
          : 'border-slate-800/60 bg-slate-900/30'
      }`}
    >
      {/* Alert pulse dot */}
      {isAlert && (
        <div className={`absolute top-3 right-3 h-2.5 w-2.5 rounded-full animate-pulse shadow ${
          status.alertType === 'long' ? 'bg-green-500 shadow-green-400' : 
          status.alertType === 'short' ? 'bg-red-500 shadow-red-400' : 
          'bg-yellow-500 shadow-yellow-400'
        }`} />
      )}

      {/* Header: symbol + time */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: status.color }}
        />
        <span className="text-base font-black text-white tracking-wide">
          {status.symbol}
        </span>
        <span className="text-xs text-slate-500 font-medium ml-auto">
          {status.lastScanned}
        </span>
      </div>

      {/* Indicator badges */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* RSI badge — red <30, yellow 30-70, green >70 */}
        <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${rsiStyles[rsiZone(status.rsi)].badge}`}>
          RSI&nbsp;<RsiValue value={status.rsi} />
        </span>

        {/* MACD Histogram badge — color matches actual bar color */}
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${hStyle.bg} ${hStyle.border} ${hStyle.text}`}>
          {hStyle.label}
        </span>

        {/* StochRSI badge
            Label  → StochRSI K/D
            Color  → < 20 = rojo | > 80 = verde | else = amarillo */}
        {(() => {
          const k = status.stochK;
          const d = status.stochD;
          if (k === null || d === null) {
            return (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg border text-slate-400 bg-slate-800/60 border-slate-700/50">
                ⚪ StochRSI
              </span>
            );
          }
          const isRed = k < 20 && d < 20;
          const isGreen = k > 80 && d > 80;
          const colorClass = isRed
            ? 'text-red-300 bg-red-500/20 border-red-500/50'
            : isGreen
            ? 'text-green-300 bg-green-500/20 border-green-500/50'
            : 'text-yellow-300 bg-yellow-500/15 border-yellow-500/30';
          
          return (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${colorClass}`}>
              {isRed ? '🔴' : isGreen ? '🟢' : '🟡'} Stoch K:{k.toFixed(1)} D:{d.toFixed(1)}
            </span>
          );
        })()}

      </div>

    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Main AlertPanel
export const AlertPanel: React.FC = () => {
  const { alerts, isAlarmActive, setAlarmActive } = useMarketStore();
  const [scanStatuses, setScanStatuses] = useState<Record<string, TokenScanStatus>>({});

  useEffect(() => {
    const unsub = subscribeScanStatus(setScanStatuses);
    return unsub;
  }, []);

  const statusList = Object.values(scanStatuses);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 min-h-0 flex flex-col h-full gap-5">

      {/* ── Section 1: Tokens en Vigilancia ── */}
      <div className="shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
            <Activity size={13} className="text-indigo-400" />
            Tokens en Estudio · 1H
          </h3>
          <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full font-bold border border-indigo-500/20 tracking-wider">
            RSI&lt;30 + MACD↓
          </span>
        </div>

        {statusList.length === 0 ? (
          <div className="flex items-center justify-center h-14 opacity-30">
            <Clock size={16} className="mr-2" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">
              Iniciando escaneo…
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {statusList.map((s) => (
              <TokenStatusCard key={s.symbol} status={s} />
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="shrink-0 border-t border-slate-800/70" />

      {/* ── Section 2: Historial de Alertas ── */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2">
            <Bell size={13} className="text-blue-500 animate-pulse" />
            Historial Alertas
          </h3>
        <div className="flex items-center gap-2">
          {isAlarmActive && (
            <button
              onClick={() => setAlarmActive(false)}
              className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-bounce flex items-center gap-1 shadow-lg shadow-red-600/20 transition-colors"
            >
              <Zap size={10} fill="white" /> PARAR ALARMA
            </button>
          )}
          <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full font-bold border border-blue-500/20 tracking-wider">
            {alerts.length > 0 ? `${alerts.length} alertas` : 'EN VIVO'}
          </span>
        </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 opacity-25">
              <Zap size={22} className="mb-2" />
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest text-center">
                Esperando señal 1H…
              </p>
            </div>
          ) : (
            alerts.map((a, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border relative overflow-hidden bg-slate-950/50 shadow-md ${
                  a.type === 'LONG' ? 'border-green-500/30' : 
                  a.type === 'SHORT' ? 'border-red-500/30' : 
                  'border-yellow-500/30'
                }`}
              >
                {/* Color strip */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    a.type === 'LONG' ? 'bg-green-500' : 
                    a.type === 'SHORT' ? 'bg-red-500' : 
                    'bg-yellow-500'
                  }`}
                />

                <div className="flex justify-between items-start mb-2 pl-2">
                  <div className="flex items-center gap-2">
                    {a.color && (
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: a.color }}
                      />
                    )}
                    <h4 className="text-sm font-black text-white">{a.symbol}</h4>
                    <span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {a.timeframe ?? '1H'}
                    </span>
                  </div>
                  <div
                    className={`p-1.5 rounded-lg ${
                      a.type === 'LONG'
                        ? 'bg-green-500/10 text-green-500'
                        : a.type === 'SHORT'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}
                  >
                    {a.type === 'LONG' ? <TrendingUp size={14} /> : a.type === 'SHORT' ? <TrendingDown size={14} /> : <Zap size={14} />}
                  </div>
                </div>

                <p className="text-xs text-slate-400 font-medium leading-relaxed mb-2 pl-2">
                  {a.message}
                </p>

                {/* RSI + MACD + STOCH values */}
                {(a.rsi !== undefined || a.hist !== undefined || a.stochK !== undefined) && (
                  <div className="flex items-center gap-2 pl-2 mb-2">
                    {a.rsi !== undefined && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                        a.type === 'LONG' 
                          ? 'text-green-300 bg-green-500/10 border-green-500/20' 
                          : a.type === 'SHORT'
                          ? 'text-red-300 bg-red-500/10 border-red-500/20'
                          : 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20'
                      }`}>
                        RSI {a.rsi.toFixed(1)}
                      </span>
                    )}
                    {a.hist !== undefined && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                        a.type === 'LONG' 
                          ? 'text-green-300 bg-green-500/10 border-green-500/20' 
                          : a.type === 'SHORT'
                          ? 'text-red-300 bg-red-500/10 border-red-500/20'
                          : 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20'
                      }`}>
                        HIST {a.hist.toFixed(4)}
                      </span>
                    )}
                    {a.stochK !== undefined && a.stochD !== undefined && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                        a.type === 'LONG' 
                          ? 'text-green-300 bg-green-500/10 border-green-500/20' 
                          : a.type === 'SHORT'
                          ? 'text-red-300 bg-red-500/10 border-red-500/20'
                          : 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20'
                      }`}>
                        STOCH K:{a.stochK.toFixed(1)} D:{a.stochD.toFixed(1)}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-500 pl-2">
                  <span>$ {a.price?.toLocaleString()}</span>
                  <span>{a.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
