"""Generate a clean, compatible fake database for Chrono."""

import random
from datetime import date, datetime, timedelta
from pathlib import Path
from shutil import copyfile

from chrono.db import DB_PATH, close_db, init_db
from chrono.models import Goal, TimeEntry, Timer


def backup_db() -> None:
    """Backup current DB file before overwriting fake data."""
    db_path = Path(DB_PATH)
    if db_path.exists():
        backup_path = db_path.with_suffix(".db.backup")
        copyfile(db_path, backup_path)
        print(f"Backed up existing database to {backup_path}")


def clear_db() -> None:
    """Delete all existing records."""
    Goal.delete().execute()
    TimeEntry.delete().execute()
    Timer.delete().execute()
    print("Cleared existing data.")


def generate_entries() -> tuple[Timer, Timer, Timer, Timer, Timer]:
    """Create timers and ~30 days of fake entries."""
    t_sleep = Timer.create(name="Sleep", color="#60a5fa")
    t_work = Timer.create(name="Deep Work", color="#c084fc")
    t_reading = Timer.create(name="Reading", color="#34d399")
    t_fitness = Timer.create(name="Fitness", color="#fb923c")
    t_admin = Timer.create(name="Admin / Emails", color="#f472b6")

    print("Created timers.")

    today = date.today()
    entries: list[dict] = []

    for i in range(30, -1, -1):
        current_date = today - timedelta(days=i)

        # Sleep (every day)
        sleep_hours = random.uniform(6.0, 8.5)
        sleep_end = datetime.combine(current_date, datetime.min.time()) + timedelta(hours=random.uniform(7, 9))
        sleep_start = sleep_end - timedelta(hours=sleep_hours)
        entries.append(
            {
                "timer": t_sleep.id,
                "started_at": sleep_start,
                "ended_at": sleep_end,
                "seconds": sleep_hours * 3600,
                "notes": "Good rest" if sleep_hours > 7 else "A bit tired",
            }
        )

        # Work/admin on weekdays
        if current_date.weekday() < 5:
            work_hours = random.uniform(2.5, 5.0)
            work_start = datetime.combine(current_date, datetime.min.time()) + timedelta(hours=random.uniform(9, 10))
            work_end = work_start + timedelta(hours=work_hours)
            entries.append(
                {
                    "timer": t_work.id,
                    "started_at": work_start,
                    "ended_at": work_end,
                    "seconds": work_hours * 3600,
                    "notes": "Focused session",
                }
            )

            admin_hours = random.uniform(0.5, 1.5)
            admin_start = work_end + timedelta(hours=random.uniform(0.5, 1.5))
            entries.append(
                {
                    "timer": t_admin.id,
                    "started_at": admin_start,
                    "ended_at": admin_start + timedelta(hours=admin_hours),
                    "seconds": admin_hours * 3600,
                    "notes": "Replied to emails",
                }
            )

        # Reading most days
        if random.random() > 0.2:
            read_hours = random.uniform(0.3, 1.2)
            read_start = datetime.combine(current_date, datetime.min.time()) + timedelta(hours=random.uniform(20, 22))
            entries.append(
                {
                    "timer": t_reading.id,
                    "started_at": read_start,
                    "ended_at": read_start + timedelta(hours=read_hours),
                    "seconds": read_hours * 3600,
                    "notes": random.choice(["Sci-Fi novel", "Non-fiction chapter", "Articles"]),
                }
            )

        # Fitness several times a week
        if current_date.weekday() in [0, 2, 4, 6]:
            fit_hours = random.uniform(0.8, 1.5)
            fit_start = datetime.combine(current_date, datetime.min.time()) + timedelta(hours=random.uniform(17, 18))
            entries.append(
                {
                    "timer": t_fitness.id,
                    "started_at": fit_start,
                    "ended_at": fit_start + timedelta(hours=fit_hours),
                    "seconds": fit_hours * 3600,
                    "notes": random.choice(["Gym", "Running", "Yoga"]),
                }
            )

    with Timer._meta.database.atomic():
        TimeEntry.insert_many(entries).execute()

    print(f"Inserted {len(entries)} time entries spanning 30 days.")
    return t_sleep, t_work, t_reading, t_fitness, t_admin


def generate_goals(t_work: Timer, t_reading: Timer, t_fitness: Timer) -> None:
    """Create compatible goals with explicit thresholds."""
    Goal.create(timer=t_work, type="target", period="weekly", threshold_min=20.0)
    Goal.create(timer=t_reading, type="target", period="daily", threshold_min=1.0)
    Goal.create(timer=t_fitness, type="target", period="weekly", threshold_min=4.0)
    Goal.create(timer=t_work, type="target", period="yearly", threshold_min=600.0)
    print("Created compatible goals.")


def generate_data() -> None:
    init_db()
    backup_db()
    clear_db()
    _, t_work, t_reading, t_fitness, _ = generate_entries()
    generate_goals(t_work, t_reading, t_fitness)
    close_db()
    print("Simulation complete.")
    print(f"DB path: {DB_PATH}")
    print("Delete this file and relaunch Chrono any time to reset from empty.")


if __name__ == "__main__":
    generate_data()
