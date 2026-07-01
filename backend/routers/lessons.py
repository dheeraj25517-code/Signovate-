from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database.db import get_db
from database.models import Lesson
from schemas.schemas import LessonOut

router = APIRouter(tags=["lessons"])


@router.get("/modules/{module_id}/lessons", response_model=List[LessonOut])
def get_module_lessons(module_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Lesson)
        .filter(Lesson.module_id == module_id)
        .order_by(Lesson.order)
        .all()
    )


@router.get("/lessons/{lesson_id}", response_model=LessonOut)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    return db.query(Lesson).filter(Lesson.id == lesson_id).first()
