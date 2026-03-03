"""Events screen — view time entry log with CSV export."""

from datetime import datetime
from pathlib import Path

from textual.app import ComposeResult
from textual.binding import Binding
from textual.containers import Horizontal, VerticalScroll
from textual.widget import Widget
from textual.widgets import Button, Label

from chrono.models import TimeEntry
from chrono.widgets.event_list import EventList


class EventsScreen(Widget, can_focus=True):
    """Widget showing time entries grouped by date."""

    BINDINGS = [
        Binding("escape", "close_forms", "Close", show=False),
    ]

    DEFAULT_CSS = """
    EventsScreen {
        layout: vertical;
        height: 1fr;
    }

    EventsScreen #events-header {
        height: auto;
        padding: 1 2;
        dock: top;
    }

    EventsScreen #events-title {
        width: 1fr;
        text-style: bold;
        color: $primary;
        margin: 1 0 0 0;
    }

    EventsScreen #export-btn {
        min-width: 14;
        background: $primary;
        color: $background;
    }

    EventsScreen #events-scroll {
        height: 1fr;
    }
    """

    def compose(self) -> ComposeResult:
        with Horizontal(id="events-header"):
            yield Label("📋  Events Log", id="events-title")
            yield Button("📥 Export CSV", id="export-btn")
        with VerticalScroll(id="events-scroll"):
            yield EventList()

    def refresh_data(self) -> None:
        """Refresh the events list with latest data from DB."""
        scroll = self.query_one("#events-scroll", VerticalScroll)
        scroll.remove_children()
        scroll.mount(EventList())

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "export-btn":
            self._export_csv()

    def _export_csv(self) -> None:
        csv_data = EventList.export_csv()
        if not csv_data.strip() or csv_data.count("\n") <= 1:
            self.notify("No entries to export", severity="warning")
            return

        export_dir = Path.home() / ".chrono"
        export_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        export_path = export_dir / f"chrono_export_{timestamp}.csv"
        export_path.write_text(csv_data)
        self.notify(f"Exported to {export_path}", severity="information")

    def on_event_list_entry_deleted(self, event: EventList.EntryDeleted) -> None:
        """Handle entry deletion from EventList."""
        TimeEntry.delete().where(TimeEntry.id == event.entry_id).execute()
        self.refresh_data()
        self.notify("Entry deleted", severity="warning")

    def action_close_forms(self) -> None:
        """Keyboard: Escape — placeholder for future form dismissal."""
        pass
