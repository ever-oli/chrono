"""Chrono Tracker — Main Textual TUI application."""

import os
from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.widgets import Footer, Header, TabbedContent, TabPane

from chrono.db import close_db, init_db
from chrono.screens.events import EventsScreen
from chrono.screens.goals import GoalsScreen
from chrono.screens.habits import HabitsScreen
from chrono.screens.timeline import TimelineScreen
from chrono.screens.tracking import TrackingScreen
from chrono import themes


class ChronoApp(App):
    """A terminal-based time tracking application."""

    TITLE = "Chrono"
    SUB_TITLE = ""
    CSS_PATH = None  # Set dynamically in __init__

    BINDINGS = [
        Binding("q", "quit", "Quit", show=True),
        Binding("1", "tab_tracking", "Timers", show=True),
        Binding("2", "tab_events", "Events", show=True),
        Binding("3", "tab_timeline", "Timeline", show=True),
        Binding("4", "tab_goals", "Goals", show=True),
        Binding("5", "tab_habits", "Habits", show=True),
    ]

    def __init__(self) -> None:
        theme_name = os.environ.get("CHRONO_THEME", themes.DEFAULT_THEME)
        theme_file = themes.THEMES.get(theme_name, themes.THEMES[themes.DEFAULT_THEME])
        super().__init__(css_path=theme_file)
        init_db()

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        with TabbedContent(id="tabs"):
            with TabPane("⏱  Timers", id="tab-tracking"):
                yield TrackingScreen()
            with TabPane("📋  Events", id="tab-events"):
                yield EventsScreen()
            with TabPane("📊  Timeline", id="tab-timeline"):
                yield TimelineScreen()
            with TabPane("🎯  Goals", id="tab-goals"):
                yield GoalsScreen()
            with TabPane("🟩  Habits", id="tab-habits"):
                yield HabitsScreen()
        yield Footer()

    def on_unmount(self) -> None:
        close_db()

    def on_tabbed_content_tab_activated(self, event: TabbedContent.TabActivated) -> None:
        """Refresh data when switching tabs."""
        tab_id = event.pane.id
        if tab_id == "tab-events":
            for w in self.query(EventsScreen):
                w.refresh_data()
        elif tab_id == "tab-timeline":
            for w in self.query(TimelineScreen):
                w.refresh_data()
        elif tab_id == "tab-goals":
            for w in self.query(GoalsScreen):
                w.refresh_data()
        elif tab_id == "tab-habits":
            for w in self.query(HabitsScreen):
                w.refresh_data()

    def action_tab_tracking(self) -> None:
        self.query_one(TabbedContent).active = "tab-tracking"

    def action_tab_events(self) -> None:
        self.query_one(TabbedContent).active = "tab-events"

    def action_tab_timeline(self) -> None:
        self.query_one(TabbedContent).active = "tab-timeline"

    def action_tab_goals(self) -> None:
        self.query_one(TabbedContent).active = "tab-goals"

    def action_tab_habits(self) -> None:
        self.query_one(TabbedContent).active = "tab-habits"


def main() -> None:
    app = ChronoApp()
    app.run()


if __name__ == "__main__":
    main()
