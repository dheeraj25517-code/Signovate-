"""
Wipe and re-seed the database with 3 modules split across Chapter 1.
Run with:  python -m database.seed
"""
import os
import random

# ── Delete the old DB file so SQLAlchemy recreates it with the new schema ──
DB_PATH = os.path.join(os.path.dirname(__file__), "isl_learn.db")
if os.path.exists(DB_PATH):
    os.remove(DB_PATH)
    print(f"✓ Deleted old database at {DB_PATH}")

from database.db import engine, SessionLocal
from database.models import Base, Module, Lesson, QuizOption, Progress, DailyActivity

# ── 1. Create all tables ──────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# ── 2. Wipe existing data (safe to re-run) ────────────────────────────────────
db.query(Progress).delete()
db.query(DailyActivity).delete()
db.query(QuizOption).delete()
db.query(Lesson).delete()
db.query(Module).delete()
db.commit()

# ── 3. Modules ────────────────────────────────────────────────────────────────
# Each module has `signs` (lesson screen videos) and `q_signs` (quiz screen
# videos). They MUST be the same length and in the same word order — they are
# zipped together below so lesson[i] and q_signs[i] describe the same word.
modules_data = [
    {
        "name":        "Greetings-1",
        "description": "Everyday greeting signs in ISL",
        "emoji":       "👋",
        "order":       1,
        "chapter_id":  1,
        "signs": [
            ("Hello",             "assets/greetings/Hello.mp4"),
            ("Thank You",         "assets/greetings/Thank_You.mp4"),
            ("Please",            "assets/greetings/Please.mp4"),
            ("Yes",               "assets/greetings/Yes.mp4"),
            ("No",                "assets/greetings/No.mp4"),
            ("Okay",              "assets/greetings/Okay.mp4")
        ],
        "q_signs": [
            ("Hello",             "assets/Quiz_videos/Hello.mp4"),
            ("Thank You",         "assets/Quiz_videos/Thank_You.mp4"),
            ("Please",            "assets/Quiz_videos/Please.mp4"),
            ("Yes",               "assets/Quiz_videos/Yes.mp4"),
            ("No",                "assets/Quiz_videos/No.mp4"),
            ("Okay",              "assets/Quiz_videos/Okay.mp4")
        ]
    },
    {
        "name":        "Greetings-2",
        "description": "Everyday greeting signs in ISL",
        "emoji":       "✋",
        "order":       2,
        "chapter_id":  1,
        "signs": [
            ("Good Morning",      "assets/greetings/Good_Morning.mp4"),
            ("Good Afternoon",    "assets/greetings/Good_Afternoon.mp4"),
            ("Wait",              "assets/greetings/Wait.mp4"),
            ("Welcome",           "assets/greetings/Welcome_(Reply_to_Thanks).mp4"),
            ("Help",              "assets/greetings/Help.mp4")
        ],
        "q_signs": [
            ("Good Morning",      "assets/Quiz_videos/Good_Morning.mp4"),
            ("Good Afternoon",    "assets/Quiz_videos/Good_Afternoon.mp4"),
            ("Wait",              "assets/Quiz_videos/Wait.mp4"),
            ("Welcome",           "assets/Quiz_videos/Welcome.mp4"),
            ("Help",              "assets/Quiz_videos/Help.mp4")
        ]
    },
    {
        "name":        "Greetings-3",
        "description": "Everyday greeting signs in ISL",
        "emoji":       "🤝🏻",
        "order":       3,
        "chapter_id":  1,
        "signs": [
            ("Good Evening",      "assets/greetings/Good_Evening.mp4"),
            ("Good Night",        "assets/greetings/Good_Night.mp4"),
            ("Nice to Meet You",  "assets/greetings/Nice_to_Meet_You.mp4"),
            ("Excuse Me",         "assets/greetings/Excuse_Me.mp4"),
            ("What's Up",         "assets/greetings/What's_Up.mp4"),
            ("What Is Your Name", "assets/greetings/What_Is_Your_Name.mp4")
        ],
        "q_signs": [
            ("Good Evening",      "assets/Quiz_videos/Good_Evening.mp4"),
            ("Good Night",        "assets/Quiz_videos/Good_Night.mp4"),
            ("Nice to Meet You",  "assets/Quiz_videos//Nice_To_Meet_You.mp4"),
            ("Excuse Me",         "assets/Quiz_videos/Excuse_Me.mp4"),
            ("What's Up",         "assets/Quiz_videos/What_Up.mp4"),
            ("What Is Your Name", "assets/Quiz_videos/What_Is_Your_Name.mp4")
        ]
    },
    # Add more modules here later:
    # {
    #     "name": "Classroom Phrases",
    #     "emoji": "🏫",
    #     "order": 4,
    #     "chapter_id": 2,
    #     "signs": [...],
    #     "q_signs": [...],
    # },
]

for mod_data in modules_data:
    mod = Module(
        name=mod_data["name"],
        description=mod_data.get("description", ""),
        emoji=mod_data.get("emoji", "📘"),
        order=mod_data.get("order", 1),
        chapter_id=mod_data.get("chapter_id", 1),
    )
    db.add(mod)
    db.flush()  # get mod.id

    signs   = mod_data["signs"]
    q_signs = mod_data.get("q_signs", [])

    # Sanity check — q_signs must line up 1:1 with signs by index.
    # If counts mismatch, fall back to None for the missing quiz videos
    # rather than crashing the whole seed run.
    if q_signs and len(q_signs) != len(signs):
        print(f"⚠ Warning: '{mod_data['name']}' has {len(signs)} signs but "
              f"{len(q_signs)} q_signs — quiz videos may be misaligned.")

    all_words = [word for word, _ in signs]

    for i, (word, video_path) in enumerate(signs):
        # Pull the matching quiz video by index; None if not provided
        quiz_video_path = q_signs[i][1] if i < len(q_signs) else None

        lesson = Lesson(
            module_id=mod.id,
            word=word,
            video_path=video_path,
            quiz_video_path=quiz_video_path,
            order=i,
        )
        db.add(lesson)
        db.flush()  # get lesson.id

        # 4 quiz options: the correct word + 3 random others from the same module
        wrong_words   = [w for w in all_words if w != word]
        wrong_sample  = random.sample(wrong_words, min(3, len(wrong_words)))
        options       = [(word, True)] + [(w, False) for w in wrong_sample]
        random.shuffle(options)
        for option_text, is_correct in options:
            db.add(QuizOption(lesson_id=lesson.id, option_text=option_text, is_correct=is_correct))

db.commit()
db.close()

print("✓ Database seeded successfully.")