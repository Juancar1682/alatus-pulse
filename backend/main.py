from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.metrics import router as metrics_router
from routers.insights import router as insights_router
from routers.practices import router as practices_router
from routers.live_feed import router as live_feed_router

app = FastAPI(title="Alatus Pulse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(metrics_router)
app.include_router(insights_router)
app.include_router(practices_router)
app.include_router(live_feed_router)

@app.get("/health")
def health():
    return {"status": "ok"}