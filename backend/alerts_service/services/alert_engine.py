from typing import List, Dict, Any, Optional

class AlertEngine:
    """
    Engine to evaluate technical conditions and trigger alerts.
    Follows SOLID: Open for new alerts, closed for modifications to core logic.
    """
    def evaluate(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if len(data) < 2:
            return []
        
        last = data[-1]
        prev = data[-2]
        alerts = []

        # RSI Alerts
        rsi = last.get('rsi')
        if rsi is not None:
            if rsi > 70:
                alerts.append({"type": "ALTA VOL", "msg": f"RSI en sobrecompra (>70): {rsi:.1f}"})
            elif rsi < 30:
                alerts.append({"type": "OPORTUNIDAD", "msg": f"RSI en sobreventa (<30): {rsi:.1f}"})

        # MACD Alerts
        hist = last.get('hist')
        prev_hist = prev.get('hist')
        if hist is not None and prev_hist is not None:
            if hist > 0 and prev_hist <= 0:
                alerts.append({"type": "MACD 4h", "msg": "Cruce alcista MACD detectado"})
            elif hist < 0 and prev_hist >= 0:
                alerts.append({"type": "MACD 4h", "msg": "Cruce bajista MACD detectado"})

        return alerts
