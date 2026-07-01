from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.db import get_db
from database.models import QuizOption
from schemas.schemas import QuizOut

router = APIRouter(tags=["quiz"])


@router.get("/lessons/{lesson_id}/quiz", response_model=QuizOut)
def get_quiz(lesson_id: int, db: Session = Depends(get_db)):
    options = (
        db.query(QuizOption)
        .filter(QuizOption.lesson_id == lesson_id)
        .all()
    )
    option_texts   = [o.option_text for o in options]
    correct_index  = next((i for i, o in enumerate(options) if o.is_correct), 0)
    return {"options": option_texts, "correct_index": correct_index}
