"""Goal progress card widget."""

from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical
from textual.message import Message
from textual.widget import Widget
from textual.widgets import Button, Label, ProgressBar, Static


class GoalCard(Widget):
    """Displays a single goal with progress bar."""

    DEFAULT_CSS = """
    GoalCard {
        height: auto;
        margin: 0 0 1 0;
        padding: 1 2;
        background: #16213e;
        border: solid #3a3a5e;
    }

    GoalCard .goal-header {
        height: auto;
    }

    GoalCard .goal-title {
        width: 1fr;
        text-style: bold;
        color: #e0e0e0;
    }

    GoalCard .goal-meta {
        width: auto;
        color: #a0a0b8;
        margin: 0 1;
    }

    GoalCard .goal-progress-text {
        color: #DC9E82;
        margin: 1 0;
    }

    GoalCard .goal-del-btn {
        min-width: 5;
        background: #16213e;
        color: #ef4444;
        border: solid #3a3a5e;
    }
    """

    class Deleted(Message):
        def __init__(self, goal_id: str) -> None:
            self.goal_id = goal_id
            super().__init__()

    def __init__(
        self,
        goal_id: str,
        timer_name: str,
        goal_type: str,
        period: str,
        threshold: float,
        progress_hours: float,
    ) -> None:
        super().__init__()
        self.goal_id = goal_id
        self.timer_name = timer_name
        self.goal_type = goal_type
        self.period = period
        self.threshold = threshold
        self.progress_hours = progress_hours

    def compose(self) -> ComposeResult:
        type_icon = "🎯" if self.goal_type == "target" else "🚫"
        pct = min(self.progress_hours / self.threshold * 100, 100) if self.threshold > 0 else 0

        # Build a simple text-based progress bar
        bar_width = 30
        filled = int(pct / 100 * bar_width)
        bar_str = "█" * filled + "░" * (bar_width - filled)

        with Horizontal(classes="goal-header"):
            yield Label(f"{type_icon} {self.timer_name}", classes="goal-title")
            yield Label(f"{self.period} · {self.threshold:.1f}h", classes="goal-meta")
            yield Button("✕", classes="goal-del-btn", id=f"gdel-{self.goal_id[:8]}")

        yield Static(
            f"  {bar_str}  {self.progress_hours:.1f}h / {self.threshold:.1f}h  ({pct:.0f}%)",
            classes="goal-progress-text",
        )

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == f"gdel-{self.goal_id[:8]}":
            event.stop()
            self.post_message(self.Deleted(self.goal_id))
