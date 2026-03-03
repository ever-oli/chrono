"""GitHub-style activity grid widget for habits visualization."""

from collections import defaultdict
from datetime import date, datetime, timedelta

from textual.app import ComposeResult
from textual.containers import Horizontal
from textual.widget import Widget
from textual.widgets import Label, Static

from chrono.models import TimeEntry, Timer

INTENSITY_CHARS = "░▒▓█"
DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]


class HabitGrid(Widget):
    """A GitHub-style contribution grid showing daily activity intensity for a specific timer."""

    DEFAULT_CSS = """
    HabitGrid {
        height: auto;
        padding: 1 2;
        margin: 0 0 1 0;
        background: $surface;
        border: solid $secondary;
    }

    HabitGrid .grid-header {
        height: 2;
        margin: 0 0 1 0;
    }

    HabitGrid .grid-color {
        width: 2;
        content-align: center middle;
    }

    HabitGrid .grid-title {
        text-style: bold;
        color: $foreground;
        width: 1fr;
    }

    HabitGrid .grid-empty-msg {
        color: $secondary;
        padding: 1 2;
    }

    HabitGrid .grid-row {
        height: 1;
        color: $foreground;
    }

    HabitGrid .grid-legend {
        height: 1;
        color: $secondary;
        margin: 1 0 0 0;
    }
    """

    def __init__(self, timer: Timer, weeks: int = 26) -> None:
        super().__init__()
        self.timer = timer
        self.weeks = weeks

    def _load_activity(self) -> dict[str, float]:
        """Load daily total seconds from the database for this specific timer."""
        end = date.today()
        start = end - timedelta(weeks=self.weeks)

        entries = list(
            TimeEntry
            .select()
            .where(
                TimeEntry.timer == self.timer,
                TimeEntry.ended_at.is_null(False),
                TimeEntry.started_at >= datetime.combine(start, datetime.min.time()),
            )
        )

        by_date: dict[str, float] = defaultdict(float)
        for e in entries:
            if isinstance(e.started_at, datetime):
                day_key = e.started_at.strftime("%Y-%m-%d")
            else:
                day_key = str(e.started_at)[:10]
            by_date[day_key] += e.seconds

        return by_date

    def compose(self) -> ComposeResult:
        with Horizontal(classes="grid-header"):
            yield Label(f"[{self.timer.color}]●[/]", classes="grid-color")
            yield Label(self.timer.name, classes="grid-title")

        activity = self._load_activity()
        if not activity:
            yield Static("No recorded activity in this timeframe.", classes="grid-empty-msg")
            return

        max_seconds = max(activity.values())

        today = date.today()
        # Shift so Sunday is the start of the week like the Lovable design
        days_since_sunday = (today.weekday() + 1) % 7
        start_date = today - timedelta(weeks=self.weeks - 1, days=days_since_sunday)

        grid_rows: list[list[str]] = [[] for _ in range(7)]

        for week in range(self.weeks):
            for day_offset in range(7): # 0=Sun, 1=Mon, ..., 6=Sat
                d = start_date + timedelta(weeks=week, days=day_offset)
                if d > today:
                    grid_rows[day_offset].append(" ")
                    continue
                key = d.strftime("%Y-%m-%d")
                secs = activity.get(key, 0)
                if secs == 0:
                    grid_rows[day_offset].append(f"[dim]·[/]")
                else:
                    intensity = min(int(secs / max_seconds * len(INTENSITY_CHARS)), len(INTENSITY_CHARS) - 1)
                    char = INTENSITY_CHARS[intensity]
                    # The highest intensity gets the timer's color, lower get dimmed
                    # For simplicity, color all non-zero chars with the timer's color
                    grid_rows[day_offset].append(f"[{self.timer.color}]{char}[/]")

        # Only display Sun, Tue, Thu, Sat labels to match standard GitHub style
        for i, row in enumerate(grid_rows):
            label = DAY_LABELS[i] if i in (0, 2, 4, 6) else "   "
            cells = "".join(row)
            yield Static(f"  {label}  {cells}", classes="grid-row")
