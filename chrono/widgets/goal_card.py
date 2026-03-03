"""Goal progress card widget with color-coded status and streak info."""

from datetime import datetime, timedelta

from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical
from textual.message import Message
from textual.reactive import reactive
from textual.widget import Widget
from textual.widgets import Button, Label, ProgressBar, Sparkline, Static


def _time_until_reset(period: str) -> str:
    """Return a human-readable string for when the period resets."""
    now = datetime.now()
    if period == "daily":
        reset = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "weekly":
        days_until_monday = (7 - now.weekday()) % 7 or 7
        reset = (now + timedelta(days=days_until_monday)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
    elif period == "monthly":
        if now.month == 12:
            reset = now.replace(year=now.year + 1, month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            reset = now.replace(month=now.month + 1, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:  # yearly
        reset = now.replace(year=now.year + 1, month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

    delta = reset - now
    hours_left = delta.total_seconds() / 3600

    if hours_left < 1:
        mins = int(delta.total_seconds() / 60)
        return f"{mins}m left"
    elif hours_left < 24:
        return f"{int(hours_left)}h left"
    else:
        days = int(hours_left / 24)
        return f"{days}d left"


class GoalCard(Widget):
    """Displays a single goal with a real progress bar and color-coded status."""

    DEFAULT_CSS = """
    GoalCard {
        height: auto;
        margin: 0 0 1 0;
        padding: 1 2;
        background: $surface;
        border: solid $secondary;
    }

    GoalCard.goal-met {
        border: solid $success;
    }

    GoalCard.goal-exceeded {
        border: solid $error;
    }

    GoalCard .goal-header {
        height: auto;
    }

    GoalCard .goal-color-dot {
        width: 2;
        margin: 0 1 0 0;
    }

    GoalCard .goal-title {
        width: 1fr;
        text-style: bold;
        color: $foreground;
    }

    GoalCard .goal-status-icon {
        width: auto;
        margin: 0 1;
    }

    GoalCard .goal-meta {
        width: auto;
        color: $secondary;
        margin: 0 1;
    }

    GoalCard .goal-countdown {
        width: auto;
        color: $secondary;
        margin: 0 1;
    }

    GoalCard .goal-progress-row {
        height: auto;
        margin: 1 0 0 0;
    }

    GoalCard .goal-history {
        height: auto;
        margin: 1 0 0 0;
        color: $secondary;
    }

    GoalCard .goal-history-label {
        width: auto;
        color: $secondary;
        margin: 0 1 0 0;
    }

    GoalCard .goal-history-sparkline {
        width: 1fr;
        min-height: 1;
    }

    GoalCard .goal-progress-bar {
        width: 1fr;
        margin: 0 1 0 0;
    }

    GoalCard .goal-progress-text {
        width: auto;
        color: $foreground;
        min-width: 20;
        text-align: right;
    }

    GoalCard .goal-progress-text.met {
        color: $success;
    }

    GoalCard .goal-progress-text.exceeded {
        color: $error;
    }

    GoalCard .goal-streak {
        color: $secondary;
        margin: 1 0 0 0;
        height: auto;
    }

    GoalCard .goal-actions {
        height: auto;
        margin: 1 0 0 0;
    }

    GoalCard .goal-edit-btn {
        min-width: 5;
        background: $surface;
        color: $primary;
        border: solid $secondary;
    }

    GoalCard .goal-del-btn {
        min-width: 5;
        background: $surface;
        color: $error;
        border: solid $secondary;
    }

    GoalCard .goal-confirm-del-btn {
        background: $error;
        color: $background;
        min-width: 10;
        display: none;
    }

    GoalCard .goal-cancel-del-btn {
        background: $surface;
        color: $foreground;
        min-width: 8;
        border: solid $secondary;
        display: none;
    }

    GoalCard.confirming .goal-del-btn {
        display: none;
    }

    GoalCard.confirming .goal-edit-btn {
        display: none;
    }

    GoalCard.confirming .goal-confirm-del-btn {
        display: block;
    }

    GoalCard.confirming .goal-cancel-del-btn {
        display: block;
    }
    """

    _confirm_delete: reactive[bool] = reactive(False)

    class Deleted(Message):
        def __init__(self, goal_id: str) -> None:
            self.goal_id = goal_id
            super().__init__()

    class EditRequested(Message):
        def __init__(self, goal_id: str, goal_type: str, period: str, threshold: float) -> None:
            self.goal_id = goal_id
            self.goal_type = goal_type
            self.period = period
            self.threshold = threshold
            super().__init__()

    def __init__(
        self,
        goal_id: str,
        timer_name: str,
        timer_color: str,
        goal_type: str,
        period: str,
        threshold: float,
        progress_hours: float,
        streak: int = 0,
        history_values: list[float] | None = None,
    ) -> None:
        super().__init__()
        self.goal_id = goal_id
        self.timer_name = timer_name
        self.timer_color = timer_color
        self.goal_type = goal_type
        self.period = period
        self.threshold = threshold
        self.progress_hours = progress_hours
        self.streak = streak
        self.history_values = history_values or []

    def compose(self) -> ComposeResult:
        pct = (self.progress_hours / self.threshold * 100) if self.threshold > 0 else 0

        # Determine status
        is_target = self.goal_type == "target"
        if is_target:
            met = pct >= 100
            exceeded = False
            status_icon = "[bold green]✓[/]" if met else f"[{self.timer_color}]○[/]"
            display_pct = min(pct, 100)
        else:
            met = pct <= 100
            exceeded = pct > 100
            status_icon = "[bold red]![/]" if exceeded else f"[{self.timer_color}]○[/]"
            display_pct = pct

        # Set card border class
        if is_target and met:
            self.add_class("goal-met")
        elif not is_target and exceeded:
            self.add_class("goal-exceeded")

        type_label = "Target" if is_target else "Limit"
        countdown = _time_until_reset(self.period)

        # Header row: color dot, name, status, meta, countdown
        with Horizontal(classes="goal-header"):
            yield Label(f"[{self.timer_color}]●[/]", classes="goal-color-dot")
            yield Label(f"{self.timer_name}", classes="goal-title")
            yield Static(status_icon, classes="goal-status-icon")
            yield Label(f"{type_label} · {self.period}", classes="goal-meta")
            yield Label(f"{countdown}", classes="goal-countdown")

        # Progress bar row
        progress_cls = "goal-progress-text"
        if is_target and met:
            progress_cls += " met"
        elif not is_target and exceeded:
            progress_cls += " exceeded"

        with Horizontal(classes="goal-progress-row"):
            yield ProgressBar(
                total=100,
                show_eta=False,
                show_percentage=False,
                classes="goal-progress-bar",
            )
            yield Label(
                f"{self.progress_hours:.1f}h / {self.threshold:.1f}h ({display_pct:.0f}%)",
                classes=progress_cls,
            )

        if self.history_values:
            with Horizontal(classes="goal-history"):
                yield Label("Trend", classes="goal-history-label")
                yield Sparkline(self.history_values, classes="goal-history-sparkline")

        # Streak info
        if self.streak > 0:
            period_label = {
                "daily": "day",
                "weekly": "week",
                "monthly": "month",
                "yearly": "year",
            }.get(self.period, "period")
            plural = "s" if self.streak != 1 else ""
            yield Static(
                f"  🔥 {self.streak} {period_label}{plural} streak",
                classes="goal-streak",
            )

        # Action buttons
        with Horizontal(classes="goal-actions"):
            yield Button("✎", classes="goal-edit-btn", id=f"gedit-{self.goal_id[:8]}")
            yield Button("✕", classes="goal-del-btn", id=f"gdel-{self.goal_id[:8]}")
            yield Button("Delete?", classes="goal-confirm-del-btn", id=f"gcdel-{self.goal_id[:8]}")
            yield Button("Keep", classes="goal-cancel-del-btn", id=f"gkdel-{self.goal_id[:8]}")

    def on_mount(self) -> None:
        """Set the progress bar value after mount."""
        pct = (self.progress_hours / self.threshold * 100) if self.threshold > 0 else 0
        bar = self.query_one(ProgressBar)
        bar.update(progress=min(pct, 100))
        # Use timer color as the default card accent when not met/exceeded.
        if "goal-met" not in self.classes and "goal-exceeded" not in self.classes:
            self.styles.border = ("solid", self.timer_color)
        # Color progress text/bar by timer color for easy visual scanning.
        for label in self.query(".goal-progress-text"):
            if "met" not in label.classes and "exceeded" not in label.classes:
                label.styles.color = self.timer_color
        bar.styles.color = self.timer_color
        for spark in self.query(Sparkline):
            spark.styles.color = self.timer_color

    def watch__confirm_delete(self, value: bool) -> None:
        self.set_class(value, "confirming")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        bid = event.button.id or ""
        if bid == f"gedit-{self.goal_id[:8]}":
            event.stop()
            self.post_message(self.EditRequested(
                self.goal_id, self.goal_type, self.period, self.threshold,
            ))
        elif bid == f"gdel-{self.goal_id[:8]}":
            event.stop()
            self._confirm_delete = True
        elif bid == f"gcdel-{self.goal_id[:8]}":
            event.stop()
            self._confirm_delete = False
            self.post_message(self.Deleted(self.goal_id))
        elif bid == f"gkdel-{self.goal_id[:8]}":
            event.stop()
            self._confirm_delete = False
