from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from database.db import get_db
from database.models import Progress, DailyActivity
from schemas.schemas import ProgressIn

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("", response_model=List[int])
def get_progress(db: Session = Depends(get_db)):
    """Returns a flat list of completed lesson IDs — matches what data.js expects."""
    rows = db.query(Progress).all()
    return [r.lesson_id for r in rows]


@router.post("/complete")
def complete_lesson(payload: ProgressIn, db: Session = Depends(get_db)):
    """Idempotent — safe to call multiple times for the same lesson.
    Also records today as an active day for the streak calendar."""
    # Save lesson progress
    exists = db.query(Progress).filter(Progress.lesson_id == payload.lesson_id).first()
    if not exists:
        db.add(Progress(lesson_id=payload.lesson_id, module_id=payload.module_id))

    # Record today as an active day (idempotent)
    today = date.today().isoformat()
    day_exists = db.query(DailyActivity).filter(DailyActivity.activity_date == today).first()
    if not day_exists:
        db.add(DailyActivity(activity_date=today))

    db.commit()
    return {"status": "ok"}
