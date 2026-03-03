"""Goals screen — set and track time goals per timer."""

from collections import defaultdict
from datetime import datetime, timedelta

from peewee import fn
from textual.app import ComposeResult
from textual.binding import Binding
from textual.containers import Horizontal, Vertical, VerticalScroll
from textual.widget import Widget
from textual.widgets import Button, Input, Label, Select, Static

from chrono.models import Goal, TimeEntry, Timer
from chrono.widgets.goal_card import GoalCard


# ---------------------------------------------------------------------------
# Period helpers
# ---------------------------------------------------------------------------

def _get_period_start(period: str, offset: int = 0) -> datetime:
    """Return the start datetime for a period.

    *offset* shifts backwards: 0 = current period, 1 = previous, etc.
    """
    now = datetime.now()
    if period == "daily":
        base = now.replace(hour=0, minute=0, second=0, microsecond=0)
        return base - timedelta(days=offset)
    elif period == "weekly":
        base = now.replace(hour=0, minute=0, second=0, microsecond=0)
        base -= timedelta(days=base.weekday())  # Monday
        return base - timedelta(weeks=offset)
    elif period == "monthly":
        month = now.month - offset
        year = now.year
        while month < 1:
            month += 12
            year -= 1
        return datetime(year, month, 1)
    else:  # yearly
        return datetime(now.year - offset, 1, 1)


def _get_period_end(period: str, period_start: datetime) -> datetime:
    """Return the exclusive end datetime for a period that starts at *period_start*."""
    if period == "daily":
        return period_start + timedelta(days=1)
    elif period == "weekly":
        return period_start + timedelta(weeks=1)
    elif period == "monthly":
        month = period_start.month + 1
        year = period_start.year
        if month > 12:
            month = 1
            year += 1
        return datetime(year, month, 1)
    else:  # yearly
        return datetime(period_start.year + 1, 1, 1)


def _seconds_in_period(timer_id: str, period_start: datetime, period_end: datetime) -> float:
    """Sum TimeEntry seconds for *timer_id* inside [period_start, period_end).

    Includes running entries by estimating elapsed seconds from started_at -> now.
    """
    now = datetime.now()
    total = 0.0
    entries = (
        TimeEntry.select(TimeEntry.seconds, TimeEntry.started_at, TimeEntry.ended_at)
        .where(
            TimeEntry.timer == timer_id,
            TimeEntry.started_at >= period_start,
            TimeEntry.started_at < period_end,
        )
    )
    for entry in entries:
        if entry.ended_at is None:
            total += max((now - entry.started_at).total_seconds(), 0)
        else:
            total += entry.seconds or 0
    return total


def _calculate_streak(goal) -> int:
    """Count how many consecutive *completed* past periods met the goal.

    We start from the period immediately before the current one and walk
    backwards.  The current (in-progress) period is never part of the streak.
    """
    threshold = goal.threshold_min if goal.type == "target" else (goal.threshold_max or 0)
    if not threshold or threshold <= 0:
        return 0

    streak = 0
    for offset in range(1, 366):  # up to ~1 year back
        p_start = _get_period_start(goal.period, offset)
        p_end = _get_period_end(goal.period, p_start)
        secs = _seconds_in_period(str(goal.timer_id), p_start, p_end)
        hours = secs / 3600

        if goal.type == "target":
            if hours >= threshold:
                streak += 1
            else:
                break
        else:  # limit
            if hours <= threshold:
                streak += 1
            else:
                break

    return streak


def _history_values_for_goal(goal) -> list[float]:
    """Return recent completed-period hours for sparkline display."""
    points_by_period = {
        "daily": 7,
        "weekly": 8,
        "monthly": 12,
        "yearly": 6,
    }
    points = points_by_period.get(goal.period, 7)
    values: list[float] = []

    # Completed periods only (exclude current in-progress period)
    for offset in range(points, 0, -1):
        p_start = _get_period_start(goal.period, offset)
        p_end = _get_period_end(goal.period, p_start)
        secs = _seconds_in_period(str(goal.timer_id), p_start, p_end)
        values.append(secs / 3600)

    return values


# ---------------------------------------------------------------------------
# Goals screen
# ---------------------------------------------------------------------------

PERIOD_ORDER = {"daily": 0, "weekly": 1, "monthly": 2, "yearly": 3}
PERIOD_HEADERS = {
    "daily": "Daily Goals",
    "weekly": "Weekly Goals",
    "monthly": "Monthly Goals",
    "yearly": "Yearly Goals",
}


class GoalsScreen(Widget, can_focus=True):
    """Widget for managing time goals."""

    BINDINGS = [
        Binding("escape", "close_forms", "Close", show=False),
    ]

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
        color: $primary;
        margin: 1 0 0 0;
    }

    GoalsScreen #add-goal-btn {
        min-width: 12;
        background: $primary;
        color: $background;
    }

    /* ---------- summary strip ---------- */
    GoalsScreen #goals-summary {
        height: auto;
        padding: 0 2 1 2;
        color: $secondary;
        display: none;
    }

    GoalsScreen #goals-summary.visible {
        display: block;
    }

    /* ---------- form (shared for create / edit) ---------- */
    GoalsScreen #goal-form {
        height: auto;
        padding: 1 2;
        margin: 0 2;
        background: $surface;
        border: solid $primary;
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
        color: $foreground;
    }

    GoalsScreen #form-title {
        text-style: bold;
        color: $primary;
        margin: 0 0 1 0;
    }

    /* ---------- section headers ---------- */
    GoalsScreen .section-header {
        height: auto;
        padding: 0 0 0 0;
        margin: 1 0 0 0;
        text-style: bold;
        color: $primary;
    }

    GoalsScreen #goals-scroll {
        height: 1fr;
        padding: 1 2;
    }

    GoalsScreen .empty-msg {
        text-align: center;
        color: $secondary;
        margin: 2 0;
    }
    """

    def __init__(self) -> None:
        super().__init__()
        self._editing_goal_id: str | None = None

    def compose(self) -> ComposeResult:
        with Horizontal(id="goals-header"):
            yield Label("🎯  Goals", id="goals-title")
            yield Button("+ New Goal", id="add-goal-btn")

        yield Static("", id="goals-summary")

        with Vertical(id="goal-form"):
            yield Label("New Goal", id="form-title")

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
                    [
                        ("Daily", "daily"),
                        ("Weekly", "weekly"),
                        ("Monthly", "monthly"),
                        ("Yearly", "yearly"),
                    ],
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

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def on_mount(self) -> None:
        self._refresh_goals()

    def refresh_data(self) -> None:
        """Refresh goals list with latest data from DB."""
        self._refresh_goals()

    # ------------------------------------------------------------------
    # Core refresh
    # ------------------------------------------------------------------

    def _refresh_goals(self) -> None:
        scroll = self.query_one("#goals-scroll", VerticalScroll)
        scroll.remove_children()

        goals = list(Goal.select(Goal, Timer).join(Timer).where(Goal.active == True))

        if not goals:
            self.query_one("#goals-summary").remove_class("visible")
            scroll.mount(
                Static(
                    "No active goals yet.\n    Press '+ New Goal' to set a daily, weekly, or monthly target.",
                    classes="empty-msg",
                )
            )
            return

        # --- Build enriched goal data ---
        goal_data: list[dict] = []
        met_count = 0

        for goal in goals:
            period_start = _get_period_start(goal.period)
            period_end = _get_period_end(goal.period, period_start)
            progress_seconds = _seconds_in_period(str(goal.timer_id), period_start, period_end)
            progress_hours = progress_seconds / 3600
            threshold = goal.threshold_min if goal.type == "target" else (goal.threshold_max or 0)
            streak = _calculate_streak(goal)
            history_values = _history_values_for_goal(goal)

            # Is this goal currently met?
            if threshold and threshold > 0:
                if goal.type == "target":
                    met = progress_hours >= threshold
                else:
                    met = progress_hours <= threshold
            else:
                met = False

            if met:
                met_count += 1

            goal_data.append({
                "goal": goal,
                "progress_hours": progress_hours,
                "threshold": threshold or 0,
                "streak": streak,
                "timer_color": goal.timer.color,
                "timer_name": goal.timer.name,
                "history_values": history_values,
            })

        # --- Summary header ---
        total = len(goals)
        summary = self.query_one("#goals-summary", Static)
        summary.update(f"  {met_count} of {total} goals met this period")
        summary.add_class("visible")

        # --- Group by period ---
        by_period: dict[str, list[dict]] = defaultdict(list)
        for gd in goal_data:
            by_period[gd["goal"].period].append(gd)

        for period in sorted(by_period, key=lambda p: PERIOD_ORDER.get(p, 99)):
            header_text = PERIOD_HEADERS.get(period, period.title())
            scroll.mount(Static(f"  {header_text}", classes="section-header"))

            for gd in by_period[period]:
                g = gd["goal"]
                scroll.mount(
                    GoalCard(
                        goal_id=g.id,
                        timer_name=gd["timer_name"],
                        timer_color=gd["timer_color"],
                        goal_type=g.type,
                        period=g.period,
                        threshold=gd["threshold"],
                        progress_hours=gd["progress_hours"],
                        streak=gd["streak"],
                        history_values=gd["history_values"],
                    )
                )

    # ------------------------------------------------------------------
    # Timer select helper
    # ------------------------------------------------------------------

    def _refresh_timer_select(self) -> None:
        """Reload the timer Select dropdown with current timers from DB."""
        select = self.query_one("#goal-timer-select", Select)
        timers = list(Timer.select())
        options = [(t.name, t.id) for t in timers]
        select.set_options(options)

    # ------------------------------------------------------------------
    # Button handling
    # ------------------------------------------------------------------

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "add-goal-btn":
            self._open_create_form()
        elif event.button.id == "cancel-goal-btn":
            self._close_form()
        elif event.button.id == "create-goal-btn":
            if self._editing_goal_id:
                self._save_edit()
            else:
                self._create_goal()

    # ------------------------------------------------------------------
    # Form helpers
    # ------------------------------------------------------------------

    def _open_create_form(self) -> None:
        """Open the form in create mode."""
        self._editing_goal_id = None
        self._refresh_timer_select()
        self.query_one("#form-title", Label).update("New Goal")
        self.query_one("#create-goal-btn", Button).label = "Create Goal"

        # Reset form fields
        self.query_one("#goal-timer-select", Select).value = Select.BLANK
        self.query_one("#goal-type-select", Select).value = "target"
        self.query_one("#goal-period-select", Select).value = "daily"
        self.query_one("#goal-hours-input", Input).value = "1.0"

        self.query_one("#goal-form").add_class("visible")

    def _open_edit_form(self, goal_id: str, goal_type: str, period: str, threshold: float) -> None:
        """Open the form in edit mode, pre-filled with existing values."""
        self._editing_goal_id = goal_id
        self._refresh_timer_select()
        self.query_one("#form-title", Label).update("Edit Goal")
        self.query_one("#create-goal-btn", Button).label = "Save Changes"

        # Pre-fill form: find the goal to get the timer_id
        try:
            goal = Goal.get_by_id(goal_id)
            self.query_one("#goal-timer-select", Select).value = goal.timer_id
        except Exception:
            pass

        self.query_one("#goal-type-select", Select).value = goal_type
        self.query_one("#goal-period-select", Select).value = period
        self.query_one("#goal-hours-input", Input).value = str(threshold)

        self.query_one("#goal-form").add_class("visible")

    def _close_form(self) -> None:
        self._editing_goal_id = None
        self.query_one("#goal-form").remove_class("visible")

    # ------------------------------------------------------------------
    # Create
    # ------------------------------------------------------------------

    def _create_goal(self) -> None:
        timer_id, goal_type, period, hours = self._read_form()
        if timer_id is None:
            return

        # Duplicate check
        existing = (
            Goal.select()
            .where(
                Goal.timer == timer_id,
                Goal.period == period,
                Goal.active == True,
            )
            .first()
        )
        if existing:
            self.notify(
                f"A {period} goal already exists for this timer. Edit or remove it first.",
                severity="error",
            )
            return

        try:
            goal_data: dict = {
                "timer": timer_id,
                "type": goal_type,
                "period": period,
            }
            if goal_type == "target":
                goal_data["threshold_min"] = hours
            else:
                goal_data["threshold_max"] = hours

            Goal.create(**goal_data)
            self._close_form()
            self._refresh_goals()
            self.notify(f"Goal created: {hours:.1f}h {period} {goal_type}", severity="information")
        except Exception as e:
            self.notify(f"Error creating goal: {e}", severity="error")

    # ------------------------------------------------------------------
    # Edit / save
    # ------------------------------------------------------------------

    def _save_edit(self) -> None:
        timer_id, goal_type, period, hours = self._read_form()
        if timer_id is None:
            return

        goal_id = self._editing_goal_id

        # Duplicate check (excluding the goal we are editing)
        existing = (
            Goal.select()
            .where(
                Goal.timer == timer_id,
                Goal.period == period,
                Goal.active == True,
                Goal.id != goal_id,
            )
            .first()
        )
        if existing:
            self.notify(
                f"A {period} goal already exists for this timer. Edit or remove it first.",
                severity="error",
            )
            return

        try:
            updates: dict = {
                "timer": timer_id,
                "type": goal_type,
                "period": period,
                "threshold_min": hours if goal_type == "target" else None,
                "threshold_max": hours if goal_type == "limit" else None,
            }
            Goal.update(**updates).where(Goal.id == goal_id).execute()
            self._close_form()
            self._refresh_goals()
            self.notify(f"Goal updated: {hours:.1f}h {period} {goal_type}", severity="information")
        except Exception as e:
            self.notify(f"Error updating goal: {e}", severity="error")

    # ------------------------------------------------------------------
    # Form reading + validation
    # ------------------------------------------------------------------

    def _read_form(self) -> tuple:
        """Read and validate form fields.

        Returns (timer_id, goal_type, period, hours) or (None, ...) on failure.
        """
        timer_select = self.query_one("#goal-timer-select", Select)
        type_select = self.query_one("#goal-type-select", Select)
        period_select = self.query_one("#goal-period-select", Select)
        hours_str = self.query_one("#goal-hours-input", Input).value.strip()

        timer_id = timer_select.value
        goal_type = type_select.value
        period = period_select.value

        if timer_id is Select.BLANK:
            self.notify("Please select a timer", severity="error")
            return (None, None, None, None)

        if goal_type is Select.BLANK:
            self.notify("Please select a goal type", severity="error")
            return (None, None, None, None)

        if period is Select.BLANK:
            self.notify("Please select a period", severity="error")
            return (None, None, None, None)

        if not hours_str:
            self.notify("Please enter target hours", severity="error")
            return (None, None, None, None)

        try:
            hours = float(hours_str)
        except ValueError:
            self.notify("Hours must be a number", severity="error")
            return (None, None, None, None)

        if hours <= 0:
            self.notify("Hours must be positive", severity="error")
            return (None, None, None, None)

        return (timer_id, goal_type, period, hours)

    # ------------------------------------------------------------------
    # Messages from GoalCard
    # ------------------------------------------------------------------

    def on_goal_card_deleted(self, event: GoalCard.Deleted) -> None:
        Goal.update(active=False).where(Goal.id == event.goal_id).execute()
        self._refresh_goals()
        self.notify("Goal removed", severity="warning")

    def on_goal_card_edit_requested(self, event: GoalCard.EditRequested) -> None:
        self._open_edit_form(
            goal_id=event.goal_id,
            goal_type=event.goal_type,
            period=event.period,
            threshold=event.threshold,
        )

    # ------------------------------------------------------------------
    # Keybindings
    # ------------------------------------------------------------------

    def action_close_forms(self) -> None:
        """Keyboard: Escape to close the goal form."""
        self._close_form()
