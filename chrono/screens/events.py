"""Events screen — view time entry log with CSV export."""

from pathlib import Path

from textual.app import ComposeResult
from textual.containers import Horizontal, VerticalScroll
from textual.widget import Widget
from textual.widgets import Button, Label

from chrono.widgets.event_list import EventList


class EventsScreen(Widget):
    """Widget showing time entries grouped by date."""

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
        color: #DC9E82;
        margin: 1 0 0 0;
    }

    EventsScreen #export-btn {
        min-width: 14;
        background: #DC9E82;
        color: #1a1a2e;
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
        export_path = export_dir / "chrono_export.csv"
        export_path.write_text(csv_data)
        self.notify(f"Exported to {export_path}", severity="information")
