"""Events list widget showing time entries grouped by date."""

import csv
import io
from collections import defaultdict
from datetime import datetime

from textual.app import ComposeResult
from textual.containers import Horizontal
from textual.message import Message
from textual.widget import Widget
from textual.widgets import Button, Static

from chrono.models import TimeEntry, Timer


class EventList(Widget):
    """Shows time entries grouped by date, most recent first."""

    DEFAULT_CSS = """
    EventList {
        height: auto;
        padding: 0;
    }

    EventList .date-header {
        height: 1;
        text-style: bold;
        color: $primary;
        margin: 1 0 0 0;
        padding: 0 2;
    }

    EventList .event-row {
        height: auto;
        padding: 0 2;
        color: $foreground;
    }

    EventList .event-row .event-text {
        width: 1fr;
        color: $foreground;
    }

    EventList .event-del-btn {
        background: $surface;
        color: $error;
        min-width: 5;
        border: none;
    }

    EventList .no-events {
        padding: 2;
        color: $secondary;
        text-align: center;
    }
    """

    class EntryDeleted(Message):
        def __init__(self, entry_id: str) -> None:
            self.entry_id = entry_id
            super().__init__()

    def __init__(self, limit: int = 200) -> None:
        super().__init__()
        self.limit = limit

    def _format_duration(self, seconds: float) -> str:
        total = int(seconds)
        h, remainder = divmod(total, 3600)
        m, s = divmod(remainder, 60)
        if h > 0:
            return f"{h}h {m:02d}m"
        return f"{m}m {s:02d}s"

    def compose(self) -> ComposeResult:
        entries = list(
            TimeEntry
            .select(TimeEntry, Timer)
            .join(Timer)
            .where(TimeEntry.ended_at.is_null(False))
            .order_by(TimeEntry.started_at.desc())
            .limit(self.limit)
        )

        grouped: dict[str, list] = defaultdict(list)
        for entry in entries:
            if isinstance(entry.started_at, datetime):
                day_key = entry.started_at.strftime("%Y-%m-%d")
            else:
                day_key = str(entry.started_at)[:10]
            grouped[day_key].append(entry)

        if not grouped:
            yield Static(
                "📭  No events yet.\n    Start and stop a timer to create entries.",
                classes="no-events",
            )
            return

        for day_key in sorted(grouped.keys(), reverse=True):
            yield Static(f"  📅 {day_key}", classes="date-header")
            for entry in grouped[day_key]:
                timer_name = entry.timer.name
                dur = self._format_duration(entry.seconds)
                if isinstance(entry.started_at, datetime):
                    time_str = entry.started_at.strftime("%H:%M")
                else:
                    time_str = str(entry.started_at)[11:16]
                notes = f" — {entry.notes}" if entry.notes else ""
                eid = entry.id[:8]

                yield Horizontal(
                    Static(
                        f"    {time_str}  {timer_name:<16} {dur:>10}{notes}",
                        classes="event-text",
                    ),
                    Button("✕", classes="event-del-btn", id=f"edel-{entry.id}"),
                    classes="event-row",
                )

    def on_button_pressed(self, event: Button.Pressed) -> None:
        bid = event.button.id or ""
        if bid.startswith("edel-"):
            event.stop()
            entry_id = bid[5:]  # Strip "edel-" prefix
            self.post_message(self.EntryDeleted(entry_id))

    @staticmethod
    def export_csv() -> str:
        """Export all entries as CSV string."""
        entries = list(
            TimeEntry
            .select(TimeEntry, Timer)
            .join(Timer)
            .where(TimeEntry.ended_at.is_null(False))
            .order_by(TimeEntry.started_at.desc())
        )

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Date", "Time", "Timer", "Duration (s)", "Duration", "Notes"])

        for entry in entries:
            if isinstance(entry.started_at, datetime):
                date_str = entry.started_at.strftime("%Y-%m-%d")
                time_str = entry.started_at.strftime("%H:%M:%S")
            else:
                date_str = str(entry.started_at)[:10]
                time_str = str(entry.started_at)[11:19]

            total = int(entry.seconds)
            h, rem = divmod(total, 3600)
            m, s = divmod(rem, 60)
            dur_str = f"{h}h {m:02d}m {s:02d}s"

            writer.writerow([
                date_str,
                time_str,
                entry.timer.name,
                entry.seconds,
                dur_str,
                entry.notes or "",
            ])

        return output.getvalue()
