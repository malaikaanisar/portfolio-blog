import { useMemo } from 'react';

/* ─── Line Chart ─── */
interface LineChartDataset {
  label: string;
  data: number[];
  color: string;
}

interface LineChartProps {
  labels: string[];
  datasets: LineChartDataset[];
  height?: number;
}

export function LineChart({ labels, datasets, height = 200 }: LineChartProps) {
  const svgWidth = 800;
  const svgHeight = 280;
  const padding = { top: 20, right: 20, bottom: 36, left: 50 };

  const { paths, gridLines, xLabels } = useMemo(() => {
    const allValues = datasets.flatMap((d) => d.data);
    const maxVal = Math.max(...allValues, 1);
    const range = maxVal || 1;

    const chartW = svgWidth - padding.left - padding.right;
    const chartH = svgHeight - padding.top - padding.bottom;

    // Y-axis grid lines (5 lines)
    const gridCount = 4;
    const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
      const ratio = i / gridCount;
      const y = padding.top + chartH - ratio * chartH;
      const value = Math.round(ratio * range);
      return { y, value };
    });

    // Build SVG paths for each dataset
    const paths = datasets.map((dataset) => {
      const points = dataset.data.map((val, i) => {
        const x = padding.left + (i / Math.max(dataset.data.length - 1, 1)) * chartW;
        const y = padding.top + chartH - (val / range) * chartH;
        return { x, y, val };
      });

      const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
      const baseY = padding.top + chartH;
      const areaPath = `${linePath} L${points[points.length - 1].x},${baseY} L${points[0].x},${baseY} Z`;

      return { linePath, areaPath, points, color: dataset.color, label: dataset.label };
    });

    // X-axis labels (show ~7 evenly spaced)
    const step = Math.max(1, Math.floor(labels.length / 7));
    const xLabels = labels
      .filter((_, i) => i % step === 0 || i === labels.length - 1)
      .map((label) => {
        const idx = labels.indexOf(label);
        return {
          label,
          x: padding.left + (idx / Math.max(labels.length - 1, 1)) * chartW,
        };
      });

    return { paths, gridLines, xLabels };
  }, [labels, datasets]);

  return (
    <div className="w-full">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-3">
        {datasets.map((d) => (
          <div key={d.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[11px] text-zinc-400">{d.label}</span>
          </div>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full"
        style={{ height }}
      >
        {/* Grid lines */}
        {gridLines.map((line, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={line.y}
              x2={svgWidth - padding.right}
              y2={line.y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
            <text
              x={padding.left - 8}
              y={line.y}
              fontSize="11"
              fill="rgba(255,255,255,0.3)"
              textAnchor="end"
              dominantBaseline="middle"
            >
              {line.value}
            </text>
          </g>
        ))}

        {/* Area fills */}
        {paths.map((p, i) => (
          <path
            key={`area-${i}`}
            d={p.areaPath}
            fill={p.color}
            fillOpacity="0.1"
          />
        ))}

        {/* Lines */}
        {paths.map((p, i) => (
          <path
            key={`line-${i}`}
            d={p.linePath}
            fill="none"
            stroke={p.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Data points */}
        {paths.map((p, i) =>
          p.points.map((point, j) => (
            <g key={`dot-${i}-${j}`}>
              <circle cx={point.x} cy={point.y} r="3" fill={p.color} opacity="0.8" />
              {/* Hover target */}
              <circle cx={point.x} cy={point.y} r="10" fill="transparent">
                <title>{`${datasets[i].label}: ${point.val}`}</title>
              </circle>
            </g>
          ))
        )}

        {/* X-axis labels */}
        {xLabels.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={svgHeight - 8}
            fontSize="11"
            fill="rgba(255,255,255,0.35)"
            textAnchor="middle"
          >
            {l.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ─── Horizontal Bar Chart ─── */
interface BarChartItem {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface HorizontalBarChartProps {
  items: BarChartItem[];
  color?: string;
  maxItems?: number;
}

export function HorizontalBarChart({
  items,
  color = '#FB2576',
  maxItems = 10,
}: HorizontalBarChartProps) {
  const displayItems = items.slice(0, maxItems);
  const maxVal = Math.max(...displayItems.map((d) => d.value), 1);

  return (
    <div className="space-y-2.5">
      {displayItems.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-300 truncate max-w-[70%]" title={item.label}>
              {item.label}
            </span>
            <div className="flex items-center gap-2">
              {item.secondaryValue !== undefined && (
                <span className="text-[10px] text-zinc-500">{item.secondaryValue} users</span>
              )}
              <span className="text-xs font-semibold text-zinc-100 tabular-nums">
                {item.value.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / maxVal) * 100}%`,
                backgroundColor: color,
                opacity: 1 - i * 0.06,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Donut Chart ─── */
interface DonutItem {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  items: DonutItem[];
  size?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

export function DonutChart({
  items,
  size = 160,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  const radius = 56;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;
  const segments = items.map((item) => {
    const percentage = item.value / total;
    const dashLength = circumference * percentage;
    const dashOffset = circumference - cumulativeOffset;
    cumulativeOffset += dashLength;
    return { ...item, percentage, dashLength, dashOffset };
  });

  return (
    <div className="flex items-center gap-6">
      <div className="flex-shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dashLength} ${circumference - seg.dashLength}`}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          ))}
          {/* Center text */}
          {(centerLabel || centerValue) && (
            <g className="rotate-90" style={{ transformOrigin: '70px 70px' }}>
              {centerValue && (
                <text
                  x="70"
                  y="66"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="18"
                  fontWeight="700"
                  fill="white"
                >
                  {centerValue}
                </text>
              )}
              {centerLabel && (
                <text
                  x="70"
                  y="82"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                  fill="rgba(255,255,255,0.4)"
                >
                  {centerLabel}
                </text>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-zinc-400 flex-1 truncate">{item.label}</span>
            <span className="text-xs font-semibold text-zinc-200 tabular-nums">
              {Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Vertical Bar Chart ─── */
interface VerticalBarChartProps {
  data: Array<{ label: string; value: number }>;
  color?: string;
  height?: number;
}

export function VerticalBarChart({
  data,
  color = '#FB2576',
  height = 120,
}: VerticalBarChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm transition-all duration-300 hover:opacity-80 group relative"
            style={{
              height: `${Math.max((d.value / maxVal) * 100, 3)}%`,
              backgroundColor: color,
              opacity: 0.7 + (d.value / maxVal) * 0.3,
            }}
          >
            {/* Tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-zinc-800 text-zinc-100 text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
              {d.value}
            </div>
          </div>
        ))}
      </div>
      <div className="flex mt-1.5">
        {data
          .filter((_, i) => i % Math.max(1, Math.floor(data.length / 7)) === 0)
          .map((d, i) => (
            <div
              key={i}
              className="flex-1 text-[10px] text-zinc-600 text-center"
            >
              {d.label}
            </div>
          ))}
      </div>
    </div>
  );
}

/* ─── Stat Change Indicator ─── */
export function StatChange({ value, suffix = '' }: { value: number; suffix?: string }) {
  if (value === 0) return <span className="text-xs text-zinc-500">No change</span>;
  const isUp = value > 0;
  return (
    <span className={`text-xs font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
      {isUp ? '↑' : '↓'} {Math.abs(value)}{suffix}
    </span>
  );
}
