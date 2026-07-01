from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from database.db import Base


class Module(Base):
    __tablename__ = "modules"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)       # e.g. "Greetings"
    description = Column(String, default="")
    emoji       = Column(String, default="📘")         # e.g. "👋"
    order       = Column(Integer, default=0)           # display order
    chapter_id  = Column(Integer, default=1)           # which chapter this module belongs to


class Lesson(Base):
    __tablename__ = "lessons"

    id              = Column(Integer, primary_key=True, index=True)
    module_id       = Column(Integer, ForeignKey("modules.id"), nullable=False)
    word            = Column(String, nullable=False)       # e.g. "Hello"
    video_path      = Column(String, nullable=False)       # e.g. "assets/greetings/Hello.mp4"
    quiz_video_path = Column(String, nullable=True)        # separate quiz-folder video; falls back to video_path if null
    order           = Column(Integer, default=0)           # position within module


class QuizOption(Base):
    __tablename__ = "quiz_options"

    id          = Column(Integer, primary_key=True, index=True)
    lesson_id   = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    option_text = Column(String, nullable=False)
    is_correct  = Column(Boolean, default=False)


class Progress(Base):
    __tablename__ = "progress"

    id          = Column(Integer, primary_key=True, index=True)
    lesson_id   = Column(Integer, nullable=False, unique=True)  # one row per lesson
    module_id   = Column(Integer, nullable=False)


class DailyActivity(Base):
    """One row per calendar day the user completed at least one lesson."""
    __tablename__ = "daily_activity"

    id            = Column(Integer, primary_key=True, index=True)
    activity_date = Column(String, nullable=False, unique=True)  # "YYYY-MM-DD"