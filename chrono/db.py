"""Database initialization and migration helpers."""

from pathlib import Path

from .models import ALL_MODELS, database

DB_DIR = Path.home() / ".chrono"
DB_PATH = DB_DIR / "data.db"


def init_db() -> None:
    """Initialize the SQLite database and create tables if needed."""
    DB_DIR.mkdir(parents=True, exist_ok=True)
    database.init(str(DB_PATH), pragmas={
        "journal_mode": "wal",
        "cache_size": -1024 * 64,
        "foreign_keys": 1,
    })
    database.connect()
    database.create_tables(ALL_MODELS)


def close_db() -> None:
    """Close the database connection."""
    if not database.is_closed():
        database.close()
