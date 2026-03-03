"""Habits screen — GitHub-style activity grids per timer."""

from textual.app import ComposeResult
from textual.containers import VerticalScroll
from textual.widget import Widget
from textual.widgets import Label, Static

from chrono.models import Timer
from chrono.widgets.habit_grid import HabitGrid


class HabitsScreen(Widget):
    """Widget showing a GitHub-style activity contribution grid for each habit."""

    DEFAULT_CSS = """
    HabitsScreen {
        layout: vertical;
        height: 1fr;
    }

    HabitsScreen #habits-header {
        height: auto;
        padding: 1 2;
    }

    HabitsScreen #habits-title {
        text-style: bold;
        color: $primary;
    }

    HabitsScreen #habits-info {
        color: $secondary;
        padding: 0 2;
        height: auto;
    }

    HabitsScreen #habits-scroll {
        height: 1fr;
        padding: 0 2;
    }
    
    HabitsScreen .empty-msg {
        color: $secondary;
        margin: 2 0;
        text-align: center;
    }
    """

    def __init__(self) -> None:
        super().__init__()
        self._loaded = False

    def compose(self) -> ComposeResult:
        yield Label("🟩  Activity Habits", id="habits-title")
        yield Static(
            "  Track your daily activities and build better habits.",
            id="habits-info",
        )
        with VerticalScroll(id="habits-scroll"):
            pass  # Lazy loaded on first visit

    def on_mount(self) -> None:
        self.refresh_data()

    def refresh_data(self) -> None:
        """Refresh the habit grids with latest data from DB."""
        self._loaded = True
        scroll = self.query_one("#habits-scroll", VerticalScroll)
        scroll.remove_children()
        
        timers = list(Timer.select().order_by(Timer.created_at.desc()))
        if not timers:
            scroll.mount(Static(
                "🚀  No habits/timers yet!",
                classes="empty-msg",
            ))
            return
            
        for t in timers:
            scroll.mount(HabitGrid(timer=t, weeks=40))
