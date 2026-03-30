from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from database import SessionLocal
from models.db_models import Practice, PracticeEvent
import asyncio
import random
from datetime import datetime

router = APIRouter()

# ── Event generator 

EVENT_TEMPLATES = [
    ("job.posted",         "dentalpost",  "{name} posted a new {role} opening"),
    ("job.filled",         "dentalpost",  "{name} filled a {role} position"),
    ("member.enrolled",    "illumitrac",  "{name} enrolled a new membership member"),
    ("member.churned",     "illumitrac",  "{name} lost a membership member"),
    ("payment.failed",     "illumitrac",  "{name} had a membership payment fail"),
    ("payment.recovered",  "illumitrac",  "{name} recovered a failed payment"),
]

DENTAL_ROLES = [
    "hygienist", "dental assistant",
    "front office", "office manager", "dentist"
]


def generate_live_event(db: Session) -> dict:

    practices = db.query(Practice).all()
    practice = random.choice(practices)

    event_type, source, template = random.choice(EVENT_TEMPLATES)
    role = random.choice(DENTAL_ROLES)

    description = template.format(name=practice.name, role=role)

    # Persist it to the DB so drilldown history stays current
    event = PracticeEvent(
        practice_id=practice.id,
        practice_name=practice.name,
        event_type=event_type,
        source=source,
        description=description,
        occurred_at=datetime.now(),
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    return {
        "id": event.id,
        "practice_id": practice.id,
        "practice_name": practice.name,
        "event_type": event_type,
        "source": source,
        "description": description,
        "occurred_at": event.occurred_at.isoformat(),
    }


# ── Connection manager 

class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
        print(f"Client connected. Total: {len(self.active)}")

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)
        print(f"Client disconnected. Total: {len(self.active)}")

    async def broadcast(self, data: dict):
        for ws in self.active:
            await ws.send_json(data)


manager = ConnectionManager()


# ── WebSocket endpoint 

@router.websocket("/ws/live-feed")
async def live_feed(websocket: WebSocket):
    await manager.connect(websocket)
    db = SessionLocal()
    try:
        while True:            
            event = generate_live_event(db)
            await manager.broadcast(event)
            await asyncio.sleep(4)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    finally:
        db.close()