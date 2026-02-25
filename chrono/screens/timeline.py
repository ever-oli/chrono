"""Timeline/Analytics screen — native Textual distribution and bar charts."""

from collections import defaultdict
from datetime import datetime, timedelta

from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical, VerticalScroll
from textual.widget import Widget
from textual.widgets import Button, Label, Sparkline, Static

from chrono.models import TimeEntry, Timer


class DistributionBar(Widget):
    """A horizontal stacked bar representing time distribution."""
    
    DEFAULT_CSS = """
    DistributionBar {
        height: 1;
        margin: 1 2;
        width: 1fr;
    }
    """
    
    def __init__(self, data: list[tuple[str, float, str]]) -> None:
        super().__init__()
        self.data = data
        
    def render(self) -> str:
        if not self.data:
            return ""
        
        total = sum(d[1] for d in self.data)
        if total == 0:
            return ""
            
        width = self.size.width if self.size.width > 0 else 40
        
        result = ""
        for name, amount, color in self.data:
            ratio = amount / total
            chars_to_draw = int(round(ratio * width))
            if chars_to_draw > 0:
                result += f"[{color}]{'█' * chars_to_draw}[/]"
                
        return result


class VerticalBarChart(Widget):
    """A vertical bar chart for Time Per Activity."""

    DEFAULT_CSS = """
    VerticalBarChart {
        height: 1fr;
        padding: 1 2;
        layout: horizontal;
        align: center bottom;
    }

    VerticalBarChart .bar-column {
        width: 10;
        height: 100%;
        margin: 0 1;
        layout: vertical;
        align: center bottom;
    }

    VerticalBarChart .bar-value {
        text-align: center;
        width: 100%;
        color: #a0a0b8;
    }
    
    VerticalBarChart .bar-blocks {
        width: 4;
        content-align: center bottom;
    }

    VerticalBarChart .bar-label {
        text-align: center;
        width: 100%;
        color: #e0e0e0;
        margin-top: 1;
        height: 1;
    }
    """

    def __init__(self, data: list[tuple[str, float, str]]) -> None:
        super().__init__()
        self.data = data

    def compose(self) -> ComposeResult:
        if not self.data:
            yield Static("No data")
            return

        max_val = max(d[1] for d in self.data) if self.data else 1
        if max_val == 0:
            max_val = 1
            
        for name, amount, color in self.data[:8]: # Max 8 bars to fit screen
            # we use vertical blocks █
            ratio = amount / max_val
            # roughly 6 lines high max
            blocks_high = max(1, int(round(ratio * 6)))
            
            hours = round(amount / 3600, 1)
            
            with Vertical(classes="bar-column"):
                yield Label(f"{hours}h", classes="bar-value")
                
                # Draw the bar going upward
                bar_str = "\n".join([f"[{color}]████[/]" for _ in range(blocks_high)])
                yield Label(bar_str, classes="bar-blocks")
                
                # Truncate long names
                short_name = name[:8] + "." if len(name) > 9 else name
                yield Label(short_name, classes="bar-label")


class TimelineScreen(Widget):
    """Analytics widget with native textual distribution bar and explicit vertical bar chart."""

    DEFAULT_CSS = """
    TimelineScreen {
        layout: vertical;
        height: 1fr;
    }

    TimelineScreen #timeline-header {
        height: auto;
        padding: 1 2;
        dock: top;
    }

    TimelineScreen #timeline-title {
        width: 1fr;
        text-style: bold;
        color: #DC9E82;
        margin: 1 0 0 0;
    }

    TimelineScreen .period-btn {
        min-width: 10;
        margin: 0 1;
    }

    TimelineScreen .period-btn.active {
        background: #DC9E82;
        color: #1a1a2e;
    }

    TimelineScreen #timeline-scroll {
        height: 1fr;
        padding: 0 2;
    }

    TimelineScreen .empty-msg {
        color: #a0a0b8;
        margin: 2 0;
        text-align: center;
    }

    TimelineScreen .charts-container {
        height: 15;
        margin: 1 0;
        layout: horizontal;
    }

    TimelineScreen .chart-box {
        width: 1fr;
        height: 1fr;
        border: solid #3a3a5e;
        background: #16213e;
        margin: 0 1;
        padding: 1 2;
        layout: vertical;
    }

    TimelineScreen .chart-title {
        text-style: bold;
        color: #e0e0e0;
        margin-bottom: 1;
        text-align: center;
    }

    TimelineScreen .stats-list {
        height: auto;
        margin: 1 1;
        background: #16213e;
        border: solid #3a3a5e;
        padding: 1 2;
    }

    TimelineScreen .stat-row {
        height: auto;
        padding: 0 1;
    }

    TimelineScreen .stat-color {
        width: 2;
    }

    TimelineScreen .stat-name {
        width: 1fr;
        color: #e0e0e0;
        text-style: bold;
    }

    TimelineScreen .stat-time {
        width: auto;
        color: #a0a0b8;
    }
    """

    PERIODS = {
        "today": ("Today", 1),
        "week": ("Week", 7),
        "month": ("Month", 30),
        "year": ("Year", 365),
        "life": ("Life", 36500),
    }

    def __init__(self) -> None:
        super().__init__()
        self.current_period = "today"
        self._loaded = False

    def compose(self) -> ComposeResult:
        with Horizontal(id="timeline-header"):
            yield Label("📊  Timeline", id="timeline-title")
            for key, (label, _) in self.PERIODS.items():
                cls = "period-btn active" if key == self.current_period else "period-btn"
                yield Button(label, id=f"period-{key}", classes=cls)

        with VerticalScroll(id="timeline-scroll"):
            pass

    def on_mount(self) -> None:
        pass

    def refresh_data(self) -> None:
        self._load_data()

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id and event.button.id.startswith("period-"):
            period_key = event.button.id.replace("period-", "")
            if period_key in self.PERIODS:
                self.current_period = period_key
                for key in self.PERIODS:
                    btn = self.query_one(f"#period-{key}", Button)
                    if key == period_key:
                        btn.add_class("active")
                    else:
                        btn.remove_class("active")
                self._load_data()

    def _format_time(self, seconds: float) -> str:
        total = int(seconds)
        h, remainder = divmod(total, 3600)
        m, s = divmod(remainder, 60)
        if h > 0:
            return f"{h}h {m}m {s}s"
        elif m > 0:
            return f"{m}m {s}s"
        return f"{s}s"

    def _load_data(self) -> None:
        self._loaded = True
        scroll = self.query_one("#timeline-scroll", VerticalScroll)
        scroll.remove_children()

        _, days = self.PERIODS[self.current_period]
        
        query = TimeEntry.select(TimeEntry, Timer).join(Timer).where(
            TimeEntry.ended_at.is_null(False)
        )
        if days < 36500:
            cutoff = datetime.now() - timedelta(days=days)
            query = query.where(TimeEntry.started_at >= cutoff)

        entries = list(query)

        by_timer: dict[str, dict] = defaultdict(lambda: {"seconds": 0.0, "color": "#DC9E82", "count": 0})
        total_seconds = 0.0
        for entry in entries:
            name = entry.timer.name
            by_timer[name]["seconds"] += entry.seconds
            by_timer[name]["color"] = entry.timer.color
            by_timer[name]["count"] += 1
            total_seconds += entry.seconds

        if not by_timer:
            scroll.mount(Static(
                "📊  No data for this period yet.\n    Start tracking time and check back!",
                classes="empty-msg",
            ))
            return

        sorted_timers = sorted(by_timer.items(), key=lambda x: x[1]["seconds"], reverse=True)
        
        # Prepare data for charts
        data = [(name, info["seconds"], info["color"]) for name, info in sorted_timers]

        # 1. Charts container
        charts = Horizontal(classes="charts-container")
        scroll.mount(charts)
        
        # Distribution Chart (Horizontal Stacked Bar instead of Pie)
        dist_box = Vertical(classes="chart-box")
        charts.mount(dist_box)
        dist_box.mount(Label("Time Distribution", classes="chart-title"))
        dist_box.mount(DistributionBar(data))
        
        # Activity Chart (Vertical Bar Chart)
        act_box = Vertical(classes="chart-box")
        charts.mount(act_box)
        act_box.mount(Label("Time Per Activity", classes="chart-title"))
        act_box.mount(VerticalBarChart(data))

        # 2. Detailed list
        list_container = Vertical(classes="stats-list")
        scroll.mount(list_container)
        for name, info in sorted_timers:
            row = Horizontal(classes="stat-row")
            list_container.mount(row)
            row.mount(Label(f"[{info['color']}]●[/]", classes="stat-color"))
            row.mount(Label(name, classes="stat-name"))
            row.mount(Label(self._format_time(info["seconds"]), classes="stat-time"))
