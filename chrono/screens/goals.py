"""Goals screen — set and track time goals per timer."""

from datetime import datetime, timedelta

from peewee import fn
from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical, VerticalScroll
from textual.widget import Widget
from textual.widgets import Button, Input, Label, Select, Static

from chrono.models import Goal, TimeEntry, Timer
from chrono.widgets.goal_card import GoalCard


def _get_period_start(period: str) -> datetime:
    """Get the start datetime for a given period."""
    now = datetime.now()
    if period == "daily":
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "weekly":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        return start - timedelta(days=start.weekday())
    else:  # monthly
        return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


class GoalsScreen(Widget):
    """Widget for managing time goals."""

    DEFAULT_CSS = """
    GoalsScreen {
        layout: vertical;
        height: 1fr;
    }

    GoalsScreen #goals-header {
        height: auto;
        padding: 1 2;
        dock: top;
    }

    GoalsScreen #goals-title {
        width: 1fr;
        text-style: bold;
        color: #DC9E82;
        margin: 1 0 0 0;
    }

    GoalsScreen #add-goal-btn {
        min-width: 12;
        background: #DC9E82;
        color: #1a1a2e;
    }

    GoalsScreen #goal-form {
        height: auto;
        padding: 1 2;
        margin: 0 2;
        background: #16213e;
        border: solid #DC9E82;
        display: none;
    }

    GoalsScreen #goal-form.visible {
        display: block;
    }

    GoalsScreen .form-row {
        height: auto;
        margin: 0 0 1 0;
    }

    GoalsScreen .form-label {
        width: 16;
        margin: 1 1 0 0;
        color: #e0e0e0;
    }

    GoalsScreen #goals-scroll {
        height: 1fr;
        padding: 1 2;
    }

    GoalsScreen .empty-msg {
        text-align: center;
        color: #a0a0b8;
        margin: 2 0;
    }
    """

    def compose(self) -> ComposeResult:
        with Horizontal(id="goals-header"):
            yield Label("🎯  Goals", id="goals-title")
            yield Button("+ New Goal", id="add-goal-btn")

        with Vertical(id="goal-form"):
            with Horizontal(classes="form-row"):
                yield Label("Timer:", classes="form-label")
                yield Select([], prompt="Select a timer", id="goal-timer-select")

            with Horizontal(classes="form-row"):
                yield Label("Type:", classes="form-label")
                yield Select(
                    [("Target (minimum)", "target"), ("Limit (maximum)", "limit")],
                    value="target",
                    id="goal-type-select",
                )

            with Horizontal(classes="form-row"):
                yield Label("Period:", classes="form-label")
                yield Select(
                    [("Daily", "daily"), ("Weekly", "weekly"), ("Monthly", "monthly")],
                    value="daily",
                    id="goal-period-select",
                )

            with Horizontal(classes="form-row"):
                yield Label("Target hours:", classes="form-label")
                yield Input(value="1.0", placeholder="e.g. 2.0", id="goal-hours-input")

            with Horizontal():
                yield Button("Create Goal", id="create-goal-btn", variant="primary")
                yield Button("Cancel", id="cancel-goal-btn")

        with VerticalScroll(id="goals-scroll"):
            pass

    def on_mount(self) -> None:
        self._refresh_goals()

    def refresh_data(self) -> None:
        """Refresh goals list with latest data from DB."""
        self._refresh_goals()

    def _refresh_goals(self) -> None:
        scroll = self.query_one("#goals-scroll", VerticalScroll)
        scroll.remove_children()

        goals = list(Goal.select(Goal, Timer).join(Timer).where(Goal.active == True))

        if not goals:
            scroll.mount(Static("No goals yet. Click '+ New Goal' to set one.", classes="empty-msg"))
            return

        for goal in goals:
            period_start = _get_period_start(goal.period)
            progress_seconds = (
                TimeEntry
                .select(fn.SUM(TimeEntry.seconds))
                .where(
                    TimeEntry.timer == goal.timer,
                    TimeEntry.started_at >= period_start,
                    TimeEntry.ended_at.is_null(False),
                )
                .scalar() or 0
            )
            progress_hours = progress_seconds / 3600
            threshold = goal.threshold_min if goal.type == "target" else (goal.threshold_max or 0)

            scroll.mount(GoalCard(
                goal_id=goal.id,
                timer_name=goal.timer.name,
                goal_type=goal.type,
                period=goal.period,
                threshold=threshold or 0,
                progress_hours=progress_hours,
            ))

    def _refresh_timer_select(self) -> None:
        """Reload the timer Select dropdown with current timers from DB."""
        select = self.query_one("#goal-timer-select", Select)
        timers = list(Timer.select())
        options = [(t.name, t.id) for t in timers]
        select.set_options(options)

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "add-goal-btn":
            self._refresh_timer_select()
            self.query_one("#goal-form").add_class("visible")
        elif event.button.id == "cancel-goal-btn":
            self.query_one("#goal-form").remove_class("visible")
        elif event.button.id == "create-goal-btn":
            self._create_goal()

    def _create_goal(self) -> None:
        timer_select = self.query_one("#goal-timer-select", Select)
        type_select = self.query_one("#goal-type-select", Select)
        period_select = self.query_one("#goal-period-select", Select)
        hours_str = self.query_one("#goal-hours-input", Input).value.strip()

        timer_id = timer_select.value
        goal_type = type_select.value
        period = period_select.value

        # Validate
        if timer_id is Select.BLANK:
            self.notify("Please select a timer", severity="error")
            return

        if goal_type is Select.BLANK:
            self.notify("Please select a goal type", severity="error")
            return

        if period is Select.BLANK:
            self.notify("Please select a period", severity="error")
            return

        if not hours_str:
            self.notify("Please enter target hours", severity="error")
            return

        try:
            hours = float(hours_str)
        except ValueError:
            self.notify("Hours must be a number", severity="error")
            return

        if hours <= 0:
            self.notify("Hours must be positive", severity="error")
            return

        try:
            goal_data = {
                "timer": timer_id,
                "type": goal_type,
                "period": period,
            }
            if goal_type == "target":
                goal_data["threshold_min"] = hours
            else:
                goal_data["threshold_max"] = hours

            Goal.create(**goal_data)
            self.query_one("#goal-form").remove_class("visible")
            self._refresh_goals()
            self.notify(f"Goal created: {hours:.1f}h {period} {goal_type}", severity="information")
        except Exception as e:
            self.notify(f"Error creating goal: {e}", severity="error")

    def on_goal_card_deleted(self, event: GoalCard.Deleted) -> None:
        Goal.update(active=False).where(Goal.id == event.goal_id).execute()
        self._refresh_goals()
        self.notify("Goal removed", severity="warning")
