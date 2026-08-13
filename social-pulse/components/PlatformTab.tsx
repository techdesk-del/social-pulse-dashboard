'use client';

import { num, shortWeekLabel, fmtNum } from '../lib/utils';
import { PLATFORMS, COLORS } from '../lib/constants';
import KpiCard from './KpiCard';
import LineChart from './charts/LineChart';
import PieChart from './charts/PieChart';
import type { WeekEntry, PlatformKey } from '../lib/types';

interface Props {
  platformKey: PlatformKey;
  weeks: WeekEntry[];
  activeIndex: number;
  chartMetric: string;
  onMetricChange: (metric: string) => void;
}

export default function PlatformTab({ platformKey, weeks, activeIndex, chartMetric, onMetricChange }: Props) {
  const cfg = PLATFORMS[platformKey];
  const curr = weeks[activeIndex][platformKey] as unknown as Record<string, number>;
  const prev = activeIndex > 0 ? (weeks[activeIndex - 1][platformKey] as unknown as Record<string, number>) : null;
  const upTo = weeks.slice(0, activeIndex + 1);

  const lineLabels = upTo.map((w) => shortWeekLabel(w.weekId));
  const lineData = upTo.map((w) => num((w[platformKey] as unknown as Record<string, number>)[chartMetric]));
  const metricLabel = cfg.metrics.find((m) => m.key === chartMetric)?.label ?? chartMetric;

  // Pie chart config
  let pieLabels: string[], pieColors: string[], pieKeys: string[];
  if (platformKey === 'linkedin') {
    pieLabels = ['Reactions', 'Comments', 'Reposts'];
    pieColors = [cfg.accent, COLORS.flat, COLORS.textFaint];
    pieKeys = ['reactions', 'comments', 'reposts'];
  } else {
    pieLabels = ['Content Interactions', 'Link Clicks'];
    pieColors = [cfg.accent, COLORS.flat];
    pieKeys = ['contentInteractions', 'linkClicks'];
  }
  const pieData = pieKeys.map((k) => num(curr[k]));

  const leftVal = num(curr[cfg.primaryKey]);
  const rightVal = num(curr[cfg.secondaryKey]);
  const maxV = Math.max(leftVal, rightVal, 1);

  function cardsFor(fields: { key: string; label: string }[]) {
    return fields.map((m) => {
      const sparkVals = upTo.slice(-6).map((w) => num((w[platformKey] as unknown as Record<string, number>)[m.key]));
      return (
        <KpiCard
          key={m.key}
          label={m.label}
          value={num(curr[m.key])}
          prevValue={prev ? num(prev[m.key]) : null}
          sparkValues={sparkVals}
          accent={cfg.accent}
        />
      );
    });
  }

  return (
    <>
      {cfg.groups ? (
        cfg.groups.map((g, gi) => (
          <div key={g.title}>
            <div className="group-head">
              <span className="group-num" style={{ background: cfg.accent }}>
                {gi + 1}
              </span>
              {g.title}
              <span className="group-line" />
            </div>
            <div className="kpi-grid">{cardsFor(g.fields)}</div>
          </div>
        ))
      ) : (
        <div className="kpi-grid">{cardsFor(cfg.metrics)}</div>
      )}

      <div className="charts-row">
        <div className="card chart-card">
          <div className="chart-head">
            <div className="chart-title">Trend over time</div>
            <select
              className="metric-select"
              value={chartMetric}
              onChange={(e) => onMetricChange(e.target.value)}
              id={`metric-select-${platformKey}`}
            >
              {cfg.metrics.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>
          <div style={{ height: 230 }}>
            <LineChart labels={lineLabels} data={lineData} color={cfg.accent} label={metricLabel} />
          </div>
        </div>

        <div className="card chart-card">
          <div className="chart-title" style={{ marginBottom: 10 }}>Engagement mix — this week</div>
          <div style={{ height: 190 }}>
            <PieChart data={pieData} colors={pieColors} labels={pieLabels} />
          </div>
          {pieLabels.map((l, i) => (
            <div className="legend-row" key={l}>
              <span className="legend-dot" style={{ background: pieColors[i] }} />
              {l}
              <span className="legend-val">{fmtNum(num(curr[pieKeys[i]]))}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card visitor-card">
        <div className="chart-title" style={{ marginBottom: 12 }}>
          {platformKey === 'linkedin' ? 'Visitor breakdown' : `Views vs. ${cfg.secondaryLabel}`}
        </div>
        <div className="vbar-row">
          <div className="vbar-label">{cfg.primaryLabel}</div>
          <div className="vbar-track">
            <div
              className="vbar-fill"
              style={{ width: `${(leftVal / maxV) * 100}%`, background: cfg.accent }}
            />
          </div>
          <div className="vbar-value">{fmtNum(leftVal)}</div>
        </div>
        <div className="vbar-row">
          <div className="vbar-label">{cfg.secondaryLabel}</div>
          <div className="vbar-track">
            <div
              className="vbar-fill"
              style={{ width: `${(rightVal / maxV) * 100}%`, background: COLORS.textFaint }}
            />
          </div>
          <div className="vbar-value">{fmtNum(rightVal)}</div>
        </div>
      </div>
    </>
  );
}
