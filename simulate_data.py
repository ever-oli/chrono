import os
import random
from datetime import date, datetime, timedelta
from shutil import copyfile

from chrono.db import init_db
from chrono.models import Timer, TimeEntry, Goal

def get_db_path() -> str:
    db_dir = os.path.expanduser("~/.chrono")
    return os.path.join(db_dir, "chrono.db")

def backup_db():
    db_path = get_db_path()
    if os.path.exists(db_path):
        backup_path = db_path + ".backup"
        copyfile(db_path, backup_path)
        print(f"Backed up existing database to {backup_path}")

def clear_db():
    # Delete all records
    Goal.delete().execute()
    TimeEntry.delete().execute()
    Timer.delete().execute()
    print("Cleared existing data.")

def generate_data():
    init_db()
    backup_db()
    clear_db()

    # 1. Create Timers
    t_sleep = Timer.create(name="Sleep", color="#60a5fa")   # Blue
    t_work = Timer.create(name="Deep Work", color="#c084fc") # Purple
    t_reading = Timer.create(name="Reading", color="#34d399")# Green
    t_fitness = Timer.create(name="Fitness", color="#fb923c")# Orange
    t_admin = Timer.create(name="Admin / Emails", color="#f472b6") # Pink

    print("Created timers.")

    # 2. Generate 30 days of activity
    today = date.today()
    
    entries = []
    
    for i in range(30, -1, -1):
        current_date = today - timedelta(days=i)
        
        # Sleep (Every day, 6-8.5 hours)
        sleep_hours = random.uniform(6.0, 8.5)
        # Assuming sleep is previous night, ends in morning
        end_time = datetime.combine(current_date, datetime.min.time()) + timedelta(hours=random.uniform(7, 9))
        start_time = end_time - timedelta(hours=sleep_hours)
        entries.append(dict(
            timer=t_sleep,
            started_at=start_time,
            ended_at=end_time,
            seconds=sleep_hours * 3600,
            notes="Good rest" if sleep_hours > 7 else "A bit tired"
        ))

        # Deep Work (Weekdays mostly, 2-5 hours)
        if current_date.weekday() < 5: # Mon-Fri
            work_hours = random.uniform(2.5, 5.0)
            work_start = datetime.combine(current_date, datetime.min.time()) + timedelta(hours=random.uniform(9, 10))
            work_end = work_start + timedelta(hours=work_hours)
            entries.append(dict(
                timer=t_work,
                started_at=work_start,
                ended_at=work_end,
                seconds=work_hours * 3600,
                notes="Focused session"
            ))
            
            # Admin (Weekdays, 30m - 1.5h)
            admin_hours = random.uniform(0.5, 1.5)
            admin_start = work_end + timedelta(hours=random.uniform(0.5, 1.5))
            entries.append(dict(
                timer=t_admin,
                started_at=admin_start,
                ended_at=admin_start + timedelta(hours=admin_hours),
                seconds=admin_hours * 3600,
                notes="Replied to emails"
            ))

        # Reading (Mostly every day, 20m - 1h)
        if random.random() > 0.2: # 80% chance
            read_hours = random.uniform(0.3, 1.2)
            read_start = datetime.combine(current_date, datetime.min.time()) + timedelta(hours=random.uniform(20, 22))
            entries.append(dict(
                timer=t_reading,
                started_at=read_start,
                ended_at=read_start + timedelta(hours=read_hours),
                seconds=read_hours * 3600,
                notes=random.choice(["Sci-Fi novel", "Non-fiction chapter", "Articles"])
            ))

        # Fitness (3-4 times a week, ~1h)
        if current_date.weekday() in [0, 2, 4, 6]: # Mon, Wed, Fri, Sun
            fit_hours = random.uniform(0.8, 1.5)
            fit_start = datetime.combine(current_date, datetime.min.time()) + timedelta(hours=random.uniform(17, 18))
            entries.append(dict(
                timer=t_fitness,
                started_at=fit_start,
                ended_at=fit_start + timedelta(hours=fit_hours),
                seconds=fit_hours * 3600,
                notes=random.choice(["Gym", "Running", "Yoga"])
            ))

    # Bulk insert
    with Timer._meta.database.atomic():
        TimeEntry.insert_many(entries).execute()
        
    print(f"Inserted {len(entries)} time entries spanning 30 days.")

    # 3. Create Goals for current week
    sun_offset = (today.weekday() + 1) % 7
    week_start = today - timedelta(days=sun_offset)
    week_end = week_start + timedelta(days=6)
    
    # 20h of Deep Work goal
    Goal.create(
        timer=t_work,
        target_seconds=20 * 3600,
        start_date=week_start,
        end_date=week_end
    )
    
    # 3.5h of Fitness
    Goal.create(
        timer=t_fitness,
        target_seconds=3.5 * 3600,
        start_date=week_start,
        end_date=week_end
    )
    
    # 5h of Reading
    Goal.create(
        timer=t_reading,
        target_seconds=5 * 3600,
        start_date=week_start,
        end_date=week_end
    )
    
    print("Created weekly goals.")
    print("Simulation complete! You can open Chrono to view screenshots.")
    print(f"If you want to restore your original database, move ~/.chrono/chrono.db.backup to ~/.chrono/chrono.db")

if __name__ == '__main__':
    generate_data()
