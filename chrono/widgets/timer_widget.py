"""Individual timer card widget with start/stop/delete controls."""

import uuid
from datetime import datetime

from textual.app import ComposeResult
from textual.containers import Horizontal
from textual.message import Message
from textual.reactive import reactive
from textual.widget import Widget
from textual.widgets import Button, Label, Static

from chrono.models import TimeEntry


class TimerWidget(Widget, can_focus=True):
    """A single timer card showing name, elapsed time, and controls."""

    DEFAULT_CSS = """
    TimerWidget {
        layout: horizontal;
        height: 5;
        margin: 0 0 1 0;
        padding: 0 1;
        background: $surface;
        border: solid $secondary;
    }

    TimerWidget:focus {
        border: double $primary;
    }

    TimerWidget.running {
        border: solid $success;
    }

    TimerWidget.running:focus {
        border: double $success;
    }

    TimerWidget .timer-color {
        width: 2;
        margin: 1 1 0 0;
        content-align: center middle;
    }

    TimerWidget .timer-name {
        width: 1fr;
        margin: 1 0 0 0;
        text-style: bold;
        color: $foreground;
    }

    TimerWidget .timer-elapsed {
        width: 12;
        margin: 1 1 0 0;
        text-align: right;
        color: $secondary;
    }

    TimerWidget .timer-elapsed.active {
        color: $success;
        text-style: bold;
    }

    TimerWidget .start-btn {
        background: $success;
        color: $background;
        min-width: 8;
    }

    TimerWidget .stop-btn {
        background: $error;
        color: $background;
        min-width: 8;
    }

    TimerWidget .edit-btn {
        background: $surface;
        color: $primary;
        min-width: 5;
        border: solid $secondary;
    }

    TimerWidget .del-btn {
        background: $surface;
        color: $error;
        min-width: 5;
        border: solid $secondary;
    }

    TimerWidget .confirm-del-btn {
        background: $error;
        color: $background;
        min-width: 10;
        display: none;
    }

    TimerWidget .cancel-del-btn {
        background: $surface;
        color: $foreground;
        min-width: 8;
        border: solid $secondary;
        display: none;
    }

    TimerWidget.confirming .del-btn {
        display: none;
    }

    TimerWidget.confirming .edit-btn {
        display: none;
    }

    TimerWidget.confirming .confirm-del-btn {
        display: block;
    }

    TimerWidget.confirming .cancel-del-btn {
        display: block;
    }
    """

    BINDINGS = [
        ("enter", "toggle_timer", "Start/Stop"),
        ("s", "toggle_timer", "Start/Stop"),
        ("e", "edit_timer", "Edit"),
    ]

    is_running: reactive[bool] = reactive(False)
    elapsed_seconds: reactive[float] = reactive(0.0)
    _confirm_delete: reactive[bool] = reactive(False)

    class Started(Message):
        def __init__(self, timer_id: str) -> None:
            self.timer_id = timer_id
            super().__init__()

    class Stopped(Message):
        def __init__(self, timer_id: str, seconds: float) -> None:
            self.timer_id = timer_id
            self.seconds = seconds
            super().__init__()

    class Deleted(Message):
        def __init__(self, timer_id: str) -> None:
            self.timer_id = timer_id
            super().__init__()

    class Edited(Message):
        def __init__(self, timer_id: str, name: str, color: str) -> None:
            self.timer_id = timer_id
            self.name = name
            self.color = color
            super().__init__()

    class RequestNotes(Message):
        def __init__(self, timer_id: str, entry_id: str, seconds: float) -> None:
            self.timer_id = timer_id
            self.entry_id = entry_id
            self.seconds = seconds
            super().__init__()

    def __init__(self, timer_id: str, name: str, color: str = "#DC9E82") -> None:
        # Use a random unique suffix to avoid DuplicateIds on refresh
        uid = uuid.uuid4().hex[:6]
        super().__init__(id=f"tw-{uid}")
        self.timer_id = timer_id
        self.timer_name = name
        self.timer_color = color
        self._start_time: datetime | None = None
        self._tick_timer = None
        self._entry_id: str | None = None
        self._uid = uid

    def compose(self) -> ComposeResult:
        yield Static("█", classes="timer-color")
        yield Label(self.timer_name, classes="timer-name")
        yield Label(self._format_time(0), classes="timer-elapsed")
        yield Button("▶ Start", classes="start-btn", id=f"tog-{self._uid}")
        yield Button("✎", classes="edit-btn", id=f"edt-{self._uid}")
        yield Button("✕", classes="del-btn", id=f"del-{self._uid}")
        yield Button("Delete?", classes="confirm-del-btn", id=f"cdel-{self._uid}")
        yield Button("Keep", classes="cancel-del-btn", id=f"kdel-{self._uid}")

    def watch__confirm_delete(self, value: bool) -> None:
        self.set_class(value, "confirming")

    def on_mount(self) -> None:
        try:
            for w in self.query(".timer-color"):
                w.styles.color = self.timer_color
            if self.is_running:
                self.styles.border = ("solid", self.timer_color)
        except Exception:
            pass

    def _format_time(self, total_seconds: float) -> str:
        total = int(total_seconds)
        h, remainder = divmod(total, 3600)
        m, s = divmod(remainder, 60)
        return f"{h:02d}:{m:02d}:{s:02d}"

    def watch_elapsed_seconds(self, value: float) -> None:
        for lbl in self.query(".timer-elapsed"):
            lbl.update(self._format_time(value))

    def watch_is_running(self, value: bool) -> None:
        self.set_class(value, "running")
        if value:
            try:
                self.styles.border = ("solid", self.timer_color)
            except Exception:
                pass
        for btn in self.query(f"#tog-{self._uid}"):
            if value:
                btn.label = "■ Stop"
                btn.remove_class("start-btn")
                btn.add_class("stop-btn")
            else:
                btn.label = "▶ Start"
                btn.remove_class("stop-btn")
                btn.add_class("start-btn")
        for lbl in self.query(".timer-elapsed"):
            if value:
                lbl.add_class("active")
            else:
                lbl.remove_class("active")

    def _tick(self) -> None:
        if self._start_time and self.is_running:
            delta = (datetime.now() - self._start_time).total_seconds()
            self.elapsed_seconds = delta

    def action_toggle_timer(self) -> None:
        """Keyboard: Enter or S to start/stop."""
        if self.is_running:
            self.stop()
        else:
            self.start()

    def action_edit_timer(self) -> None:
        """Keyboard: E to edit."""
        self.post_message(self.Edited(self.timer_id, self.timer_name, self.timer_color))

    def start(self) -> None:
        self._start_time = datetime.now()
        entry = TimeEntry.create(
            timer=self.timer_id,
            seconds=0,
            started_at=self._start_time,
        )
        self._entry_id = entry.id
        self.is_running = True
        self._tick_timer = self.set_interval(1, self._tick)
        self.post_message(self.Started(self.timer_id))

    def stop(self) -> None:
        if self._tick_timer:
            self._tick_timer.stop()
            self._tick_timer = None
        now = datetime.now()
        seconds = self.elapsed_seconds
        entry_id = self._entry_id
        if entry_id:
            TimeEntry.update(
                seconds=seconds,
                ended_at=now,
            ).where(TimeEntry.id == entry_id).execute()
            self._entry_id = None
        self.is_running = False
        self._start_time = None
        self.elapsed_seconds = 0.0
        if entry_id and seconds >= 1:
            self.post_message(self.RequestNotes(self.timer_id, entry_id, seconds))
        else:
            self.post_message(self.Stopped(self.timer_id, seconds))

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == f"tog-{self._uid}":
            event.stop()
            self.action_toggle_timer()
        elif event.button.id == f"edt-{self._uid}":
            event.stop()
            self.action_edit_timer()
        elif event.button.id == f"del-{self._uid}":
            event.stop()
            # First click: show confirmation
            self._confirm_delete = True
        elif event.button.id == f"cdel-{self._uid}":
            event.stop()
            # Confirmed: actually delete
            self._confirm_delete = False
            if self.is_running:
                self.stop()
            self.post_message(self.Deleted(self.timer_id))
        elif event.button.id == f"kdel-{self._uid}":
            event.stop()
            # Cancelled: hide confirmation
            self._confirm_delete = False
