from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.db_models import Practice, PracticeEvent
from models.schemas import PracticeBase, PracticeDetail
from models.schemas import PracticeEvent as PracticeEventSchema

router = APIRouter(prefix="/api/practices", tags=["practices"])


@router.get("", response_model=list[PracticeBase])
def get_practices(db: Session = Depends(get_db)):
    """
    Returns all practices ordered by health score ascending —
    worst performing practices bubble to the top.
    """
    practices = (
        db.query(Practice)
        .order_by(Practice.health_score.asc())
        .all()
    )
    return practices


@router.get("/{practice_id}", response_model=PracticeDetail)
def get_practice(practice_id: int, db: Session = Depends(get_db)):
    """
    Returns a single practice plus their 20 most recent events.
    """
    practice = db.query(Practice).filter(Practice.id == practice_id).first()

    if not practice:
        raise HTTPException(status_code=404, detail="Practice not found")

    events = (
        db.query(PracticeEvent)
        .filter(PracticeEvent.practice_id == practice_id)
        .order_by(PracticeEvent.occurred_at.desc())
        .limit(20)
        .all()
    )

    
    result = PracticeDetail(
        **{c.name: getattr(practice, c.name)
           for c in practice.__table__.columns},
        recent_events=[
            PracticeEventSchema(
                id=e.id,
                practice_id=e.practice_id,
                practice_name=e.practice_name,
                event_type=e.event_type,
                source=e.source,
                description=e.description,
                occurred_at=e.occurred_at,
            )
            for e in events
        ]
    )
    return result