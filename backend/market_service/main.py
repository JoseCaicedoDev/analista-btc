from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from services.yfinance_service import YFinanceService
import uvicorn

app = FastAPI(title="CryptoAnalyzer Market API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

service = YFinanceService()

@app.get("/api/market/{ticker}/history")
async def get_history(ticker: str, period: str = "1mo", interval: str = "1h"):
    return service.get_history(ticker, period, interval)

@app.websocket("/ws/price/{ticker}")
async def websocket_endpoint(websocket: WebSocket, ticker: str):
    await websocket.accept()
    try:
        while True:
            price = service.get_latest_price(ticker)
            await websocket.send_json({"ticker": ticker, "price": price})
            await asyncio.sleep(5)  # 5 second refresh as per plan
    except WebSocketDisconnect:
        print(f"Client disconnected for {ticker}")
    except Exception as e:
        print(f"WS Error: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
