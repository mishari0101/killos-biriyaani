import { TrendUpIcon } from "@/components/ui/icons";
import type { DashboardChart } from "@/lib/dashboard/types";

const CHART_WIDTH = 336;
const CHART_HEIGHT = 168;
const BASELINE = 128;
const PLOT_TOP = 18;
const MAX_BAR_H = BASELINE - PLOT_TOP;

function BarChart({
  title,
  total,
  points,
  max,
  barColor,
  accentLabel,
}: {
  title: string;
  total: number;
  points: DashboardChart["points"];
  max: number;
  barColor: string;
  accentLabel: string;
}) {
  const slot = CHART_WIDTH / Math.max(1, points.length);
  const barWidth = Math.min(28, slot * 0.55);

  return (
    <div className="admin-card flex flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-[1.05rem] font-semibold text-[var(--admin-fg)]">
            {title}
          </h3>
          <p className="mt-0.5 text-[0.75rem] text-[var(--admin-fg-muted)]">
            Last 7 days
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[rgba(201,162,39,0.3)] bg-[var(--accent-soft)] px-3 py-1.5">
          <TrendUpIcon size={13} className="text-[var(--accent-strong)]" />
          <span className="font-serif text-lg font-semibold tabular-nums leading-none text-[var(--accent-strong)]">
            {total}
          </span>
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.08em] text-[var(--fg-muted)]">
            {accentLabel}
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="mt-5 w-full"
        role="img"
        aria-label={`${title} per day, last 7 days`}
      >
        {[0, 0.5, 1].map((fraction) => {
          const y = BASELINE - MAX_BAR_H * fraction;
          return (
            <line
              key={fraction}
              x1={0}
              x2={CHART_WIDTH}
              y1={y}
              y2={y}
              stroke="var(--admin-border)"
              strokeWidth={1}
              strokeDasharray={fraction === 0 ? undefined : "3 4"}
            />
          );
        })}

        {points.map((point, index) => {
          const height = max === 0 ? 4 : Math.max(4, (point.value / max) * MAX_BAR_H);
          const x = index * slot + (slot - barWidth) / 2;
          const y = BASELINE - height;
          return (
            <g key={point.date}>
              <title>{`${point.label} · ${point.date} · ${point.value}`}</title>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={height}
                rx={5}
                fill={barColor}
                opacity={point.value === 0 ? 0.18 : 1}
              />
              {point.value > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize={9.5}
                  fontWeight={600}
                  fill="var(--admin-fg-muted)"
                  className="tabular-nums"
                >
                  {point.value}
                </text>
              )}
              <text
                x={x + barWidth / 2}
                y={BASELINE + 20}
                textAnchor="middle"
                fontSize={10.5}
                fill="var(--admin-fg-muted)"
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function DashboardCharts({
  reservations,
  messages,
}: {
  reservations: DashboardChart;
  messages: DashboardChart;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-lg font-semibold text-[var(--admin-fg)]">
        Traffic overview
      </h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <BarChart
          title="Reservations"
          total={reservations.total}
          points={reservations.points}
          max={reservations.max}
          barColor="var(--accent)"
          accentLabel="Bookings"
        />
        <BarChart
          title="Contact Messages"
          total={messages.total}
          points={messages.points}
          max={messages.max}
          barColor="var(--brand-cta)"
          accentLabel="Enquiries"
        />
      </div>
    </section>
  );
}
