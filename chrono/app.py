"""Chrono Tracker — Main Textual TUI application."""

from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.widgets import Footer, Header, TabbedContent, TabPane

from chrono.db import close_db, init_db
from chrono.screens.events import EventsScreen
from chrono.screens.goals import GoalsScreen
from chrono.screens.habits import HabitsScreen
from chrono.screens.timeline import TimelineScreen
from chrono.screens.tracking import TrackingScreen
from chrono.themes import TERMINAL_SEXY_THEMES

CSS = """
Screen {
    background: $background;
    color: $foreground;
}

Header {
    background: $surface;
    color: $primary;
}

Footer {
    background: $surface;
    color: $accent;
}

TabbedContent {
    height: 1fr;
}

TabPane {
    padding: 0;
}

Tabs {
    background: $surface;
}

Tab {
    background: $surface;
    color: $secondary;
    padding: 0 2;
}

Tab.-active {
    background: $primary;
    color: $background;
    text-style: bold;
}

Underline > .underline--bar {
    color: $error;
}

Button {
    background: $surface;
    color: $primary;
    border: solid $secondary;
}

Button:hover {
    background: $error;
    color: $background;
}

Button.-primary {
    background: $primary;
    color: $background;
}

Button.-primary:hover {
    background: $error;
    color: $background;
}

Input {
    background: $surface;
    color: $foreground;
    border: solid $primary;
}

Input:focus {
    border: solid $error;
}

Select {
    background: $surface;
    color: $foreground;
}

SelectCurrent {
    background: $surface;
    border: solid $primary;
    color: $foreground;
}

ProgressBar {
    height: 1;
}

Bar > .bar--bar {
    color: $primary;
}

Bar > .bar--complete {
    color: $success;
}

Label {
    color: $foreground;
}

Static {
    color: $foreground;
}

Toast {
    background: $surface;
    border: solid $primary;
    color: $foreground;
}
"""


class ChronoApp(App):
    """A terminal-based time tracking application."""

    TITLE = "Chrono"
    SUB_TITLE = ""
    CSS = CSS

    BINDINGS = [
        Binding("q", "quit", "Quit", show=True),
        Binding("1", "tab_tracking", "Timers", show=True),
        Binding("2", "tab_events", "Events", show=True),
        Binding("3", "tab_timeline", "Timeline", show=True),
        Binding("4", "tab_goals", "Goals", show=True),
        Binding("5", "tab_habits", "Habits", show=True),
    ]

    def __init__(self) -> None:
        super().__init__()
        init_db()

    def on_mount(self) -> None:
        for theme in TERMINAL_SEXY_THEMES:
            self.register_theme(theme)

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
