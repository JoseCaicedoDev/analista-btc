import yfinance as yf
import pandas as pd
from typing import List, Dict, Any

class YFinanceService:
    """
    Service to handle data fetching from Yahoo Finance.
    Follows SRP by only focusing on data retrieval.
    """
    def get_history(self, ticker: str, period: str = "1mo", interval: str = "1h") -> List[Dict[str, Any]]:
        try:
            df = yf.download(ticker, period=period, interval=interval, progress=False)
            if df.empty:
                return []
            
            # Reset index to get timestamps as a column
            df = df.reset_index()
            
            # Formatting for frontend (recharts expects simple objects)
            # Use 'price' key to match the prototype logic
            result = []
            for _, row in df.iterrows():
                # Extract OHLC values safely
                get_val = lambda col: float(row[col].iloc[0]) if isinstance(row[col], pd.Series) else float(row[col])
                
                result.append({
                    "time": row.iloc[0].timestamp() * 1000,
                    "open": get_val('Open'),
                    "high": get_val('High'),
                    "low": get_val('Low'),
                    "close": get_val('Close'),
                    "price": get_val('Close') # Keep 'price' for backward compatibility
                })
            return result
        except Exception as e:
            print(f"Error fetching history for {ticker}: {e}")
            return []

    def get_latest_price(self, ticker: str) -> float:
        try:
            t = yf.Ticker(ticker)
            # fast_info is reliable for latest price
            return float(t.fast_info['last_price'])
        except Exception:
            # Fallback if fast_info fails
            data = yf.download(ticker, period="1d", interval="1m", progress=False)
            if not data.empty:
                return float(data['Close'].iloc[-1])
            return 0.0
