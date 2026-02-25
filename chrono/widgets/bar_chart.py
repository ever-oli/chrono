"""Text-based horizontal bar chart widget."""

from textual.app import ComposeResult
from textual.widget import Widget
from textual.widgets import Static


class BarChart(Widget):
    """A simple text-based horizontal bar chart."""

    DEFAULT_CSS = """
    BarChart {
        height: auto;
        padding: 1 2;
        background: $surface;
        border: solid $primary-background;
    }

    BarChart .bar-title {
        color: $text;
        text-style: bold;
        margin: 0 0 1 0;
    }

    BarChart .bar-row {
        height: 1;
    }
    """

    def __init__(self, data: list[tuple[str, float, str]], title: str = "") -> None:
        """
        Args:
            data: List of (label, value, color_hex) tuples.
            title: Optional chart title.
        """
        super().__init__()
        self.data = data
        self.title = title

    def compose(self) -> ComposeResult:
        if self.title:
            yield Static(f"  {self.title}", classes="bar-title")

        if not self.data:
            yield Static("  No data yet", classes="bar-row")
            return

        max_val = max(v for _, v, _ in self.data) if self.data else 1
        max_label_len = max(len(label) for label, _, _ in self.data)
        bar_width = 30

        for label, value, color in self.data:
            padded = label.ljust(max_label_len)
            if max_val > 0:
                filled = value / max_val * bar_width
                full_blocks = int(filled)
                bar = "█" * full_blocks
            else:
                bar = ""

            hours = value / 3600
            if value >= 3600:
                val_str = f"{hours:.1f}h"
            elif value >= 60:
                val_str = f"{value / 60:.0f}m"
            else:
                val_str = f"{value:.0f}s"

            yield Static(f"  {padded}  {bar} {val_str}", classes="bar-row")
