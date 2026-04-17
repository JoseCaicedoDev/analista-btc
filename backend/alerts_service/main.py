from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from services.alert_engine import AlertEngine
import uvicorn
import json

app = FastAPI(title="CryptoAnalyzer Alerts API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = AlertEngine()

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # The client sends the processed data with indicators
            # The service evaluates and sends back alerts
            message = await websocket.receive_text()
            data = json.loads(message)
            
            alerts = engine.evaluate(data)
            if alerts:
                await websocket.send_json(alerts)
    except WebSocketDisconnect:
        print("Alert client disconnected")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
