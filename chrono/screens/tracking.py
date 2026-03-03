"""Tracking screen — manage and run timers."""

from textual.app import ComposeResult
from textual.binding import Binding
from textual.containers import Horizontal, Vertical, VerticalScroll
from textual.widget import Widget
from textual.widgets import Button, Input, Label, Select, Static

from chrono.models import TimeEntry, Timer
from chrono.widgets.timer_widget import TimerWidget


class TrackingScreen(Widget, can_focus=True):
    """Main timer management widget."""

    BINDINGS = [
        Binding("n", "new_timer", "New Timer", show=True),
        Binding("escape", "close_forms", "Close", show=False),
    ]

    DEFAULT_CSS = """
    TrackingScreen {
        layout: vertical;
        height: 1fr;
    }

    TrackingScreen #tracking-header {
        height: auto;
        padding: 1 2;
        dock: top;
    }

    TrackingScreen #tracking-title {
        width: 1fr;
        text-style: bold;
        color: $primary;
        margin: 1 0 0 0;
    }

    TrackingScreen #add-timer-btn {
        min-width: 12;
        background: $primary;
        color: $background;
    }

    TrackingScreen #new-timer-form {
        height: auto;
        padding: 1 2;
        margin: 0 2;
        background: $surface;
        border: solid $primary;
        display: none;
    }

    TrackingScreen #new-timer-form.visible {
        display: block;
    }

    TrackingScreen #edit-timer-form {
        height: auto;
        padding: 1 2;
        margin: 0 2;
        background: $surface;
        border: solid $secondary;
        display: none;
    }

    TrackingScreen #edit-timer-form.visible {
        display: block;
    }

    TrackingScreen #notes-form {
        height: auto;
        padding: 1 2;
        margin: 0 2;
        background: $surface;
        border: solid $success;
        display: none;
    }

    TrackingScreen #notes-form.visible {
        display: block;
    }

    TrackingScreen .form-label {
        margin: 1 0 0 0;
        color: $foreground;
    }

    TrackingScreen .form-hint {
        color: $secondary;
        margin: 0 0 1 0;
    }

    TrackingScreen #timer-scroll {
        height: 1fr;
        padding: 1 2;
    }

    TrackingScreen .empty-msg {
        color: $secondary;
        margin: 2 0;
        text-align: center;
    }

    TrackingScreen .empty-hint {
        color: $primary;
        margin: 1 0;
        text-align: center;
    }
    """

    COLORS = [
        ("🍑 Peach (#DC9E82)", "#DC9E82"),
        ("🌹 Rose (#C16E70)", "#C16E70"),
        ("🍏 Green (#4ade80)", "#4ade80"),
        ("🌊 Blue (#60a5fa)", "#60a5fa"),
        ("🍇 Purple (#a78bfa)", "#a78bfa"),
        ("🍋 Yellow (#fbbf24)", "#fbbf24"),
        ("🧊 Cyan (#22d3ee)", "#22d3ee"),
        ("🌸 Pink (#f472b6)", "#f472b6"),
    ]

    def __init__(self) -> None:
        super().__init__()
        self._editing_timer_id: str | None = None
        self._notes_entry_id: str | None = None
        self._notes_timer_id: str | None = None
        self._notes_seconds: float = 0

    def compose(self) -> ComposeResult:
        with Horizontal(id="tracking-header"):
            yield Label("⏱  Timers", id="tracking-title")
            yield Button("+ New Timer", id="add-timer-btn")

        # Create timer form
        with Vertical(id="new-timer-form"):
            yield Label("Timer Name:", classes="form-label")
            yield Input(placeholder="e.g. Study, Work, Exercise…", id="timer-name-input")
            yield Label("Color:", classes="form-label")
            yield Select(self.COLORS, value="#DC9E82", id="timer-color-select")
            with Horizontal():
                yield Button("Create", id="create-timer-btn", variant="primary")
                yield Button("Cancel", id="cancel-timer-btn")

        # Edit timer form
        with Vertical(id="edit-timer-form"):
            yield Label("✎ Edit Timer", classes="form-label")
            yield Label("Name:", classes="form-label")
            yield Input(placeholder="Timer name", id="edit-name-input")
            yield Label("Color:", classes="form-label")
            yield Select(self.COLORS, id="edit-color-select")
            with Horizontal():
                yield Button("Save", id="save-edit-btn", variant="primary")
                yield Button("Cancel", id="cancel-edit-btn")

        # Notes form (shown after stopping a timer)
        with Vertical(id="notes-form"):
            yield Label("📝 Add notes for this session (optional):", classes="form-label")
            yield Input(placeholder="What did you work on?", id="notes-input")
            with Horizontal():
                yield Button("Save Note", id="save-notes-btn", variant="primary")
                yield Button("Skip", id="skip-notes-btn")

        with VerticalScroll(id="timer-scroll"):
            pass

    def on_mount(self) -> None:
        self._refresh_timers()

    def _refresh_timers(self) -> None:
        scroll = self.query_one("#timer-scroll", VerticalScroll)

        # Preserve running timer widgets so we don't kill their tick intervals
        running_widgets: dict[str, TimerWidget] = {}
        for widget in self.query(TimerWidget):
            if widget.is_running:
                running_widgets[widget.timer_id] = widget

        scroll.remove_children()

        timers = list(Timer.select().order_by(Timer.created_at.desc()))
        if not timers:
            scroll.mount(Static(
                "🚀  No timers yet!",
                classes="empty-msg",
            ))
            scroll.mount(Static(
                "Click  + New Timer  or press  N  to get started",
                classes="empty-hint",
            ))
            return

        for t in timers:
            if t.id in running_widgets:
                # Re-mount the existing running widget to preserve its state
                scroll.mount(running_widgets[t.id])
            else:
                scroll.mount(TimerWidget(timer_id=t.id, name=t.name, color=t.color))

    # ---- Button handlers ----

    def on_button_pressed(self, event: Button.Pressed) -> None:
        bid = event.button.id
        if bid == "add-timer-btn":
            self._show_new_form()
        elif bid == "cancel-timer-btn":
            self._hide_new_form()
        elif bid == "create-timer-btn":
            self._create_timer()
        elif bid == "save-edit-btn":
            self._save_edit()
        elif bid == "cancel-edit-btn":
            self._hide_edit_form()
        elif bid == "save-notes-btn":
            self._save_notes()
        elif bid == "skip-notes-btn":
            self._skip_notes()

    def on_input_submitted(self, event: Input.Submitted) -> None:
        if event.input.id == "timer-name-input":
            self._create_timer()
        elif event.input.id == "edit-name-input":
            self._save_edit()
        elif event.input.id == "notes-input":
            self._save_notes()

    # ---- New timer ----

    def _show_new_form(self) -> None:
        self._hide_edit_form()
        self._hide_notes_form()
        self.query_one("#new-timer-form").add_class("visible")
        self.query_one("#timer-name-input", Input).focus()

    def _hide_new_form(self) -> None:
        self.query_one("#new-timer-form").remove_class("visible")

    def _create_timer(self) -> None:
        name = self.query_one("#timer-name-input", Input).value.strip()
        color_select = self.query_one("#timer-color-select", Select).value

        # Select.BLANK means nothing chosen, but we default to Peach string
        color = color_select if color_select is not Select.BLANK else "#DC9E82"

        if not name:
            self.notify("Enter a timer name", severity="warning")
            return

        Timer.create(name=name, color=color)
        self.query_one("#timer-name-input", Input).value = ""
        self._hide_new_form()
        self._refresh_timers()
        self.notify(f"Timer '{name}' created!", severity="information")

    # ---- Edit timer ----

    def on_timer_widget_edited(self, event: TimerWidget.Edited) -> None:
        self._editing_timer_id = event.timer_id
        self.query_one("#edit-name-input", Input).value = event.name
        
        # If the timer has a custom manual color from before we added presets,
        # we try to select it if it exists in our preset list. Otherwise we leave it blank,
        # or we could forcefully append it to options. For simplicity, just set value:
        color_select = self.query_one("#edit-color-select", Select)
        found = any(val == event.color for lbl, val in self.COLORS)
        if found:
            color_select.value = event.color
        else:
            color_select.value = Select.BLANK

        self._hide_new_form()
        self._hide_notes_form()
        self.query_one("#edit-timer-form").add_class("visible")
        self.query_one("#edit-name-input", Input).focus()

    def _save_edit(self) -> None:
        if not self._editing_timer_id:
            return
            
        name = self.query_one("#edit-name-input", Input).value.strip()
        color_val = self.query_one("#edit-color-select", Select).value

        if not name:
            self.notify("Name cannot be empty", severity="warning")
            return
            
        # Use existing color if user didn't pick anything from Blank state (for legacy colors)
        # We need to fetch the existing color to be safe if it's BLANK. Let's just enforce a color.
        if color_val is Select.BLANK:
            self.notify("Please pick a valid color from the dropdown.", severity="warning")
            return

        Timer.update(name=name, color=color_val).where(
            Timer.id == self._editing_timer_id
        ).execute()

        self._editing_timer_id = None
        self._hide_edit_form()
        self._refresh_timers()
        self.notify(f"Timer updated!", severity="information")

    def _hide_edit_form(self) -> None:
        self.query_one("#edit-timer-form").remove_class("visible")
        self._editing_timer_id = None

    # ---- Notes after stopping ----

    def on_timer_widget_request_notes(self, event: TimerWidget.RequestNotes) -> None:
        self._notes_entry_id = event.entry_id
        self._notes_timer_id = event.timer_id
        self._notes_seconds = event.seconds
        mins = event.seconds / 60
        self._hide_new_form()
        self._hide_edit_form()
        self.query_one("#notes-form").add_class("visible")
        self.query_one("#notes-input", Input).value = ""
        self.query_one("#notes-input", Input).focus()
        self.notify(f"Saved {mins:.1f} min entry", severity="information")

    def _save_notes(self) -> None:
        notes = self.query_one("#notes-input", Input).value.strip()
        if self._notes_entry_id and notes:
            TimeEntry.update(notes=notes).where(
                TimeEntry.id == self._notes_entry_id
            ).execute()
        self._hide_notes_form()

    def _skip_notes(self) -> None:
        self._hide_notes_form()

    def _hide_notes_form(self) -> None:
        self.query_one("#notes-form").remove_class("visible")
        self._notes_entry_id = None

    # ---- Timer messages ----

    def on_timer_widget_deleted(self, event: TimerWidget.Deleted) -> None:
        Timer.delete().where(Timer.id == event.timer_id).execute()
        self._refresh_timers()
        self.notify("Timer deleted", severity="warning")

    def on_timer_widget_stopped(self, event: TimerWidget.Stopped) -> None:
        mins = event.seconds / 60
        self.notify(f"Saved {mins:.1f} min entry", severity="information")

    # ---- Keyboard actions ----

    def action_new_timer(self) -> None:
        """Keyboard: N to open new timer form."""
        self._show_new_form()

    def action_close_forms(self) -> None:
        """Keyboard: Escape to close any open form."""
        self._hide_new_form()
        self._hide_edit_form()
        self._hide_notes_form()
