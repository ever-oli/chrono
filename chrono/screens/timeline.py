"""Timeline/Analytics screen — simple visuals + useful period insights."""

from collections import defaultdict
from datetime import datetime, timedelta

from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical, VerticalScroll
from textual.widget import Widget
from textual.widgets import Button, Label, Static

from graphical.bar import BarChart, BarStyle, StackedBarChart
from textual_plotext import PlotextPlot

from chrono.models import TimeEntry, Timer


class GraphicalDistributionWidget(Static):
    """Graphical stacked bar representing activity share in this period."""

    DEFAULT_CSS = """
    GraphicalDistributionWidget {
        height: auto;
        width: 1fr;
        padding: 0;
    }
    """

    def __init__(self, data: list[tuple[str, float, str]]) -> None:
        super().__init__("", classes="graphical-distribution")
        self.data = data

    def on_mount(self) -> None:
        self._render_chart()

    def on_resize(self) -> None:
        self._render_chart()

    def _render_chart(self) -> None:
        if not self.data:
            self.update("No data")
            return

        width = self.size.width if self.size.width > 0 else 56
        width = max(30, width - 2)

        top = self.data[:6]
        values = [amount / 3600 for _, amount, _ in top]
        colors = [color for _, _, color in top]
        total_hours = sum(values) or 1.0

        chart = StackedBarChart(
            title="",
            value_range=(0, total_hours),
            colors=colors,
            width=width,
        )
        chart.add_row(label="Share", values=values)
        self.update(chart)


class GraphicalBarChartWidget(Static):
    """Graphical horizontal bar chart for time per activity."""

    DEFAULT_CSS = """
    GraphicalBarChartWidget {
        height: 1fr;
        width: 1fr;
        padding: 0;
    }
    """

    def __init__(self, data: list[tuple[str, float, str]]) -> None:
        super().__init__("", classes="graphical-bar-chart")
        self.data = data

    def on_mount(self) -> None:
        self._render_chart()

    def on_resize(self) -> None:
        self._render_chart()

    def _render_chart(self) -> None:
        if not self.data:
            self.update("No data")
            return

        max_hours = max(amount / 3600 for _, amount, _ in self.data)
        if max_hours <= 0:
            max_hours = 1

        width = self.size.width if self.size.width > 0 else 56
        width = max(30, width - 2)

        chart = BarChart(
            title="",
            value_range=(0, max_hours * 1.1),
            width=width,
            bar_style=BarStyle.BLOCK,
        )

        for name, amount, color in self.data[:8]:
            hours = amount / 3600
            label = name[:12] if len(name) <= 12 else f"{name[:11]}…"
            chart.add_row(label=label, value=hours, color=color)

        self.update(chart)


class SessionDurationPlotext(PlotextPlot):
    """Session duration distribution chart powered by textual-plotext."""

    DEFAULT_CSS = """
    SessionDurationPlotext {
        height: 12;
        width: 1fr;
        margin: 1 1;
        border: solid $secondary;
        background: $surface;
    }
    """

    def __init__(self, labels: list[str], values: list[float], period_key: str) -> None:
        super().__init__()
        self._labels = labels
        self._values = values
        self._period_key = period_key

    def on_mount(self) -> None:
        self._render_plot()

    def on_resize(self) -> None:
        self._render_plot()

    def _render_plot(self) -> None:
        if not self._values:
            return

        labels = self._labels
        values = self._values

        # Guard against label/value mismatch.
        if not labels or len(labels) != len(values):
            labels = [str(i + 1) for i in range(len(values))]

        # Sample labels/values for readability on narrow terminals.
        max_points = 20 if self._period_key in {"today", "month", "life"} else len(values)
        if len(values) > max_points and max_points > 0:
            step = max(1, len(values) // max_points)
            labels = labels[::step]
            values = values[::step]

        # Ensure lengths still match after slicing.
        pair_count = min(len(labels), len(values))
        if pair_count == 0:
            return
        labels = labels[:pair_count]
        values = values[:pair_count]

        plt = self.plt
        plt.clear_figure()
        plt.theme("textual-design-dark")
        plt.title("Session Length")
        plt.xlabel("bucket")
        plt.ylabel("sessions")
        plt.bar(labels, values, color="cyan", fill=True, label="sessions")
        plt.grid(True, True)

        plot_w = max(self.size.width - 6, 20)
        plot_h = 8 if self._period_key in {"today", "week"} else 7
        plt.plotsize(plot_w, plot_h)


class PeriodTrendPlotext(PlotextPlot):
    """Supplemental trend chart powered by textual-plotext."""

    DEFAULT_CSS = """
    PeriodTrendPlotext {
        height: 12;
        width: 1fr;
        margin: 1 1;
        border: solid $secondary;
        background: $surface;
    }
    """

    def __init__(self, values: list[float], period_key: str) -> None:
        super().__init__()
        self._values = values
        self._period_key = period_key

    def on_mount(self) -> None:
        self._render_plot()

    def on_resize(self) -> None:
        self._render_plot()

    def _render_plot(self) -> None:
        if not self._values:
            return

        x = list(range(len(self._values)))
        running: list[float] = []
        total = 0.0
        for v in self._values:
            total += v
            running.append(total)

        plt = self.plt
        plt.clear_figure()
        plt.theme("textual-design-dark")
        plt.ylabel("hours")
        plt.title("Cumulative")
        plt.plot(x, running, color="green")
        plt.plot(x, self._values, color="cyan")
        plt.grid(True, True)

        # Keep readable on narrow terminals.
        plot_w = max(self.size.width - 6, 20)
        plot_h = 8 if self._period_key in {"today", "week"} else 7
        plt.plotsize(plot_w, plot_h)


class TimelineScreen(Widget):
    """Analytics widget with familiar visuals plus practical period insights."""

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
        color: $primary;
        margin: 1 0 0 0;
    }

    TimelineScreen .period-btn {
        min-width: 10;
        margin: 0 1;
    }

    TimelineScreen .period-btn.active {
        background: $primary;
        color: $background;
    }

    TimelineScreen #timeline-scroll {
        height: 1fr;
        padding: 0 2;
    }

    TimelineScreen .empty-msg {
        color: $secondary;
        margin: 2 0;
        text-align: center;
    }

    TimelineScreen .insights-row {
        height: auto;
        margin: 1 1;
        layout: horizontal;
    }

    TimelineScreen .insight-card {
        width: 1fr;
        height: auto;
        border: solid $secondary;
        background: $surface;
        margin: 0 1;
        padding: 1 2;
    }

    TimelineScreen .insight-title {
        text-style: bold;
        color: $primary;
        margin: 0 0 1 0;
    }

    TimelineScreen .insight-body {
        color: $foreground;
    }

    TimelineScreen .charts-container {
        height: 15;
        margin: 1 0;
        layout: horizontal;
    }

    TimelineScreen .chart-box {
        width: 1fr;
        height: 1fr;
        border: solid $secondary;
        background: $surface;
        margin: 0 1;
        padding: 1 2;
        layout: vertical;
    }

    TimelineScreen .chart-title {
        text-style: bold;
        color: $foreground;
        margin-bottom: 1;
        text-align: center;
    }

    TimelineScreen .stats-list {
        height: auto;
        margin: 1 1;
        background: $surface;
        border: solid $secondary;
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
        color: $foreground;
        text-style: bold;
    }

    TimelineScreen .stat-time {
        width: auto;
        color: $secondary;
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

    def compose(self) -> ComposeResult:
        with Horizontal(id="timeline-header"):
            yield Label("📊  Timeline", id="timeline-title")
            for key, (label, _) in self.PERIODS.items():
                cls = "period-btn active" if key == self.current_period else "period-btn"
                yield Button(label, id=f"period-{key}", classes=cls)

        with VerticalScroll(id="timeline-scroll"):
            pass

    def on_mount(self) -> None:
        self._load_data()

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
        if m > 0:
            return f"{m}m {s}s"
        return f"{s}s"

    def _previous_period_totals(self, days: int) -> dict[str, float]:
        if days >= 36500:
            return {}
        now = datetime.now()
        prev_end = now - timedelta(days=days)
        prev_start = now - timedelta(days=days * 2)
        prev_query = TimeEntry.select(TimeEntry, Timer).join(Timer).where(
            TimeEntry.ended_at.is_null(False),
            TimeEntry.started_at >= prev_start,
            TimeEntry.started_at < prev_end,
        )
        totals: dict[str, float] = {}
        for entry in prev_query:
            name = entry.timer.name
            totals[name] = totals.get(name, 0.0) + entry.seconds
        return totals

    def _period_elapsed_days(self, days: int) -> float:
        if self.current_period == "life":
            return float(days)
        if self.current_period == "today":
            return max(datetime.now().hour / 24, 0.25)
        if self.current_period == "week":
            return max(datetime.now().weekday() + 1, 1)
        if self.current_period == "month":
            return max(datetime.now().day, 1)
        if self.current_period == "year":
            return max(datetime.now().timetuple().tm_yday, 1)
        return float(days)

    def _trend_series(self, entries: list[TimeEntry]) -> tuple[list[str], list[float]]:
        """Build period-aware trend buckets in hours."""
        now = datetime.now()
        if self.current_period == "today":
            labels = [f"{h:02d}" for h in range(24)]
            buckets = [0.0] * 24
            for entry in entries:
                h = entry.started_at.hour
                buckets[h] += entry.seconds / 3600
            return labels, buckets

        if self.current_period in {"week", "month"}:
            span = 7 if self.current_period == "week" else 30
            labels = []
            buckets = [0.0] * span
            start = (now - timedelta(days=span - 1)).date()
            for i in range(span):
                d = start + timedelta(days=i)
                labels.append(d.strftime("%a") if span == 7 else d.strftime("%d"))
            for entry in entries:
                idx = (entry.started_at.date() - start).days
                if 0 <= idx < span:
                    buckets[idx] += entry.seconds / 3600
            return labels, buckets

        if self.current_period == "year":
            labels = []
            buckets = [0.0] * 12
            for m in range(1, 13):
                labels.append(datetime(now.year, m, 1).strftime("%b"))
            for entry in entries:
                if entry.started_at.year == now.year:
                    buckets[entry.started_at.month - 1] += entry.seconds / 3600
            return labels, buckets

        # life: last 24 months for readability
        labels = []
        buckets = [0.0] * 24
        months: list[tuple[int, int]] = []
        year = now.year
        month = now.month
        for _ in range(24):
            months.append((year, month))
            month -= 1
            if month == 0:
                month = 12
                year -= 1
        months.reverse()
        for y, m in months:
            labels.append(datetime(y, m, 1).strftime("%b %y"))
        idx_map = {ym: i for i, ym in enumerate(months)}
        for entry in entries:
            key = (entry.started_at.year, entry.started_at.month)
            if key in idx_map:
                buckets[idx_map[key]] += entry.seconds / 3600
        return labels, buckets

    def _session_duration_bins(self, entries: list[TimeEntry]) -> tuple[list[str], list[float]]:
        """Group sessions into readable duration buckets for distribution view."""
        labels = ["0-15m", "15-30m", "30-60m", "1-2h", "2h+"]
        counts = [0.0, 0.0, 0.0, 0.0, 0.0]
        for entry in entries:
            minutes = (entry.seconds or 0) / 60
            if minutes < 15:
                counts[0] += 1
            elif minutes < 30:
                counts[1] += 1
            elif minutes < 60:
                counts[2] += 1
            elif minutes < 120:
                counts[3] += 1
            else:
                counts[4] += 1
        return labels, counts

    def _load_data(self) -> None:
        scroll = self.query_one("#timeline-scroll", VerticalScroll)
        scroll.remove_children()

        _, days = self.PERIODS[self.current_period]

        query = TimeEntry.select(TimeEntry, Timer).join(Timer).where(TimeEntry.ended_at.is_null(False))
        if days < 36500:
            cutoff = datetime.now() - timedelta(days=days)
            query = query.where(TimeEntry.started_at >= cutoff)

        entries = list(query)

        by_timer: dict[str, dict] = defaultdict(lambda: {"seconds": 0.0, "color": "#DC9E82", "count": 0})
        total_seconds = 0.0
        active_days: set[str] = set()
        for entry in entries:
            name = entry.timer.name
            by_timer[name]["seconds"] += entry.seconds
            by_timer[name]["color"] = entry.timer.color
            by_timer[name]["count"] += 1
            total_seconds += entry.seconds
            active_days.add(entry.started_at.strftime("%Y-%m-%d"))

        if not by_timer:
            scroll.mount(
                Static(
                    "📊  No data for this period yet.\n    Start tracking time and check back!",
                    classes="empty-msg",
                )
            )
            return

        sorted_timers = sorted(by_timer.items(), key=lambda x: x[1]["seconds"], reverse=True)
        data = [(name, info["seconds"], info["color"]) for name, info in sorted_timers]

        prev_totals = self._previous_period_totals(days)
        prev_total_seconds = sum(prev_totals.values())
        delta_hours = (total_seconds - prev_total_seconds) / 3600

        elapsed_days = self._period_elapsed_days(days)
        projected_hours = (total_seconds / 3600) / max(elapsed_days, 0.1) * days
        consistency_pct = (len(active_days) / max(int(elapsed_days), 1)) * 100

        top_change_name = "-"
        top_change_hours = 0.0
        for name, info in sorted_timers[:5]:
            current = info["seconds"]
            previous = prev_totals.get(name, 0.0)
            change = (current - previous) / 3600
            if abs(change) > abs(top_change_hours):
                top_change_hours = change
                top_change_name = name

        # Insight cards
        insights = Horizontal(classes="insights-row")
        scroll.mount(insights)

        pace = Vertical(classes="insight-card")
        insights.mount(pace)
        pace.mount(Label("Pace", classes="insight-title"))
        pace.mount(
            Static(
                f"Now: {total_seconds / 3600:.1f}h\nProjected: {projected_hours:.1f}h by end of {self.current_period}",
                classes="insight-body",
            )
        )

        consistency = Vertical(classes="insight-card")
        insights.mount(consistency)
        consistency.mount(Label("Consistency", classes="insight-title"))
        consistency.mount(
            Static(
                f"Active days: {len(active_days)}\nConsistency: {consistency_pct:.0f}%",
                classes="insight-body",
            )
        )

        delta = Vertical(classes="insight-card")
        insights.mount(delta)
        delta.mount(Label("Delta vs Previous", classes="insight-title"))
        delta_sign = "+" if delta_hours >= 0 else ""
        top_sign = "+" if top_change_hours >= 0 else ""
        delta.mount(
            Static(
                f"Total: {delta_sign}{delta_hours:.1f}h\nTop change: {top_change_name} ({top_sign}{top_change_hours:.1f}h)",
                classes="insight-body",
            )
        )

        # Charts container
        charts = Horizontal(classes="charts-container")
        scroll.mount(charts)

        dist_box = Vertical(classes="chart-box")
        charts.mount(dist_box)
        dist_box.mount(Label("Time Distribution", classes="chart-title"))
        dist_box.mount(GraphicalDistributionWidget(data))

        act_box = Vertical(classes="chart-box")
        charts.mount(act_box)
        act_box.mount(Label("Time Per Activity", classes="chart-title"))
        act_box.mount(GraphicalBarChartWidget(data))

        # Supplemental charts using textual-plotext
        trend_labels, trend_values = self._trend_series(entries)
        duration_labels, duration_counts = self._session_duration_bins(entries)
        trends_row = Horizontal(classes="charts-container")
        scroll.mount(trends_row)

        trend_box = Vertical(classes="chart-box")
        trends_row.mount(trend_box)
        trend_box.mount(Label("Session Durations (plotext)", classes="chart-title"))
        trend_box.mount(SessionDurationPlotext(labels=duration_labels, values=duration_counts, period_key=self.current_period))

        trend2_box = Vertical(classes="chart-box")
        trends_row.mount(trend2_box)
        trend2_box.mount(Label("Cumulative (plotext)", classes="chart-title"))
        trend2_box.mount(PeriodTrendPlotext(values=trend_values, period_key=self.current_period))

        # Detailed list
        list_container = Vertical(classes="stats-list")
        scroll.mount(list_container)
        for name, info in sorted_timers:
            row = Horizontal(classes="stat-row")
            list_container.mount(row)
            row.mount(Label(f"[{info['color']}]●[/]", classes="stat-color"))
            row.mount(Label(name, classes="stat-name"))
            row.mount(Label(self._format_time(info["seconds"]), classes="stat-time"))
