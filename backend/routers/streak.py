from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta

from database.db import get_db
from database.models import DailyActivity, Progress
from schemas.schemas import StreakOut

router = APIRouter(prefix="/streak", tags=["streak"])

HEARTS_PER_LEVEL = 5   # how many active days to earn a heart


def _compute_streak(sorted_dates: list[str]) -> tuple[int, int]:
    """
    Given a sorted list of 'YYYY-MM-DD' strings (ascending),
    return (current_streak, best_streak).
    current_streak = consecutive days ending today or yesterday.
    """
    if not sorted_dates:
        return 0, 0

    from datetime import date as dt
    today = dt.today()

    dates = [dt.fromisoformat(d) for d in sorted_dates]

    # Best streak: scan all
    best = 1
    run  = 1
    for i in range(1, len(dates)):
        if (dates[i] - dates[i - 1]).days == 1:
            run += 1
            best = max(best, run)
        elif (dates[i] - dates[i - 1]).days > 1:
            run = 1

    # Current streak: walk backward from today
    current = 0
    check = today
    date_set = set(sorted_dates)
    while check.isoformat() in date_set:
        current += 1
        check -= timedelta(days=1)

    # If today not done yet, allow yesterday to keep streak alive
    if current == 0 and (today - timedelta(days=1)).isoformat() in date_set:
        check = today - timedelta(days=1)
        while check.isoformat() in date_set:
            current += 1
            check -= timedelta(days=1)

    return current, best


@router.get("", response_model=StreakOut)
def get_streak(db: Session = Depends(get_db)):
    rows = db.query(DailyActivity).order_by(DailyActivity.activity_date).all()
    active_dates = [r.activity_date for r in rows]

    current, best = _compute_streak(active_dates)

    today_done = date.today().isoformat() in set(active_dates)

    # Hearts: total active days // HEARTS_PER_LEVEL
    total_active  = len(active_dates)
    hearts        = total_active // HEARTS_PER_LEVEL
    hearts_to_next = HEARTS_PER_LEVEL - (total_active % HEARTS_PER_LEVEL)

    return StreakOut(
        current_streak  = current,
        best_streak     = best,
        active_dates    = active_dates,
        today_done      = today_done,
        hearts          = hearts,
        hearts_to_next  = hearts_to_next,
    )


@router.post("/record")
def record_activity(db: Session = Depends(get_db)):
    """
    Call this whenever a user completes a lesson.
    Records today's date. Idempotent.
    """
    today = date.today().isoformat()
    exists = db.query(DailyActivity).filter(DailyActivity.activity_date == today).first()
    if not exists:
        db.add(DailyActivity(activity_date=today))
        db.commit()
    return {"status": "ok", "date": today}
