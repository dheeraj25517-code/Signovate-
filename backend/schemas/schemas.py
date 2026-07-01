from pydantic import BaseModel
from typing import List


class ModuleOut(BaseModel):
    id:          int
    chapter_id:  int
    name:        str
    description: str
    emoji:       str
    order:       int

    class Config:
        from_attributes = True


class LessonOut(BaseModel):
    id:         int
    module_id:  int
    word:       str
    video_path: str   # frontend reads this field by name
    quiz_video_path: str | None     # used by quiz screen instead, if present
    order:      int

    class Config:
        from_attributes = True


class QuizOut(BaseModel):
    options:       List[str]
    correct_index: int


class ProgressIn(BaseModel):
    lesson_id: int
    module_id: int


class ProgressOut(BaseModel):
    completed_lesson_ids: List[int]


class StreakOut(BaseModel):
    current_streak:  int
    best_streak:     int
    active_dates:    List[str]   # ["2026-06-22", "2026-06-23", ...]
    today_done:      bool
    hearts:          int
    hearts_to_next:  int
