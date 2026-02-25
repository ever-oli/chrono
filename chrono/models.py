"""Database models for Timey Tracker using Peewee ORM."""

import uuid
from datetime import datetime
from pathlib import Path

from peewee import (
    BooleanField,
    CharField,
    DateTimeField,
    FloatField,
    ForeignKeyField,
    Model,
    SqliteDatabase,
    TextField,
)

# Database will be initialized in db.py
database = SqliteDatabase(None)


class BaseModel(Model):
    """Base model with shared configuration."""

    id = CharField(primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = DateTimeField(default=datetime.now)

    class Meta:
        database = database


class Timer(BaseModel):
    """A named timer that tracks time for a specific activity."""

    name = CharField()
    color = CharField(default="#2D2D2D")

    class Meta:
        table_name = "timers"


class TimeEntry(BaseModel):
    """A single recorded time entry for a timer."""

    timer = ForeignKeyField(Timer, backref="entries", on_delete="CASCADE")
    seconds = FloatField(default=0)
    started_at = DateTimeField(default=datetime.now)
    ended_at = DateTimeField(null=True)
    name = CharField(null=True)
    notes = TextField(null=True)
    marker_size = CharField(null=True)  # small, medium, large

    class Meta:
        table_name = "time_entries"


class Goal(BaseModel):
    """A goal tied to a timer with target/limit thresholds."""

    timer = ForeignKeyField(Timer, backref="goals", on_delete="CASCADE")
    type = CharField(default="target")  # target or limit
    period = CharField(default="daily")  # daily, weekly, monthly
    threshold_min = FloatField(null=True)
    threshold_max = FloatField(null=True)
    active = BooleanField(default=True)

    class Meta:
        table_name = "goals"


ALL_MODELS = [Timer, TimeEntry, Goal]
