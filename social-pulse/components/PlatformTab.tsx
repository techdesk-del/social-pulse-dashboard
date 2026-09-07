'use client';

import { useState } from 'react';
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
  onLiveSync?: (platform: PlatformKey) => Promise<void>;
}

export default function PlatformTab({ platformKey, weeks, activeIndex, chartMetric, onMetricChange, onLiveSync }: Props) {
  const cfg = PLATFORMS[platformKey];
  const curr = weeks[activeIndex][platformKey] as unknown as Record<string, number>;
  const prev = activeIndex > 0 ? (weeks[activeIndex - 1][platformKey] as unknown as Record<string, number>) : null;
  const upTo = weeks.slice(0, activeIndex + 1);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  async function handleSync() {
    if (!onLiveSync || isSyncing) return;
    try {
      setIsSyncing(true);
      await onLiveSync(platformKey);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3500);
    } catch (err) {
      console.warn('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }

  // Active chart metric validation
  const currentMetricKey = cfg.metrics.some((m) => m.key === chartMetric)
    ? chartMetric
    : cfg.primaryKey || cfg.metrics[0]?.key;

  // Line chart for metric deep dive
  const lineLabels = upTo.map((w) => shortWeekLabel(w.weekId));
  const lineData = upTo.map((w) => num((w[platformKey] as unknown as Record<string, number>)[currentMetricKey]));
  const metricLabel = cfg.metrics.find((m) => m.key === currentMetricKey)?.label ?? currentMetricKey;

  // Pie chart configuration matching HTML dashboard
  let pieLabels: string[] = [];
  let pieColors: string[] = [];
  let pieKeys: string[] = [];

  if (platformKey === 'linkedin') {
    pieLabels = ['Reactions', 'Comments', 'Reposts'];
    pieColors = [cfg.accent, COLORS.flat, COLORS.textFaint];
    pieKeys = ['reactions', 'comments', 'reposts'];
  } else if (platformKey === 'instagram') {
    pieLabels = ['Content Interactions', 'Link Clicks'];
    pieColors = [cfg.accent, COLORS.flat];
    pieKeys = ['contentInteractions', 'linkClicks'];
  } else {
    // Facebook
    pieLabels = ['Content Interactions', 'Link Clicks'];
    pieColors = [cfg.accent, COLORS.flat];
    pieKeys = ['contentInteractions', 'linkClicks'];
  }

  const pieData = pieKeys.map((k) => num(curr[k]));

  // Visitor Breakdown / Views Comparison matching HTML
  let visitorTitle = `${cfg.primaryLabel} vs. ${cfg.secondaryLabel}`;
  let visitorLeftLabel = cfg.primaryLabel;
  let visitorRightLabel = cfg.secondaryLabel;
  let leftVal = num(curr[cfg.primaryKey]);
  let rightVal = num(curr[cfg.secondaryKey]);

  if (platformKey === 'linkedin') {
    visitorTitle = 'Visitor breakdown';
    visitorLeftLabel = 'Unique Visitors';
    visitorRightLabel = 'Page Views';
    leftVal = num(curr.uniqueVisitors);
    rightVal = num(curr.pageViews);
  } else if (platformKey === 'instagram') {
    visitorTitle = 'Views vs. Reach';
    visitorLeftLabel = 'Views';
    visitorRightLabel = 'Reach';
    leftVal = num(curr.views || curr.impressions);
    rightVal = num(curr.reach);
  } else if (platformKey === 'facebook') {
    visitorTitle = 'Views vs. Viewers';
    visitorLeftLabel = 'Views';
    visitorRightLabel = 'Viewers';
    leftVal = num(curr.views);
    rightVal = num(curr.viewers);
  }

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
      {/* ── Executive Real-Time Platform Connection Strip ── */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(90deg, #FFFFFF 0%, #F6FAFE 100%)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '12px 18px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(18, 127, 88, 0.12)',
              border: '1px solid rgba(18, 127, 88, 0.3)',
              borderRadius: 20,
              padding: '3px 10px',
              fontSize: 11.5,
              fontWeight: 700,
              color: COLORS.up,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: COLORS.up,
                boxShadow: `0 0 8px ${COLORS.up}`,
                display: 'inline-block',
              }}
            />
            Live {cfg.label} Stream Active
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            Real-time feed for active week metrics • <strong>Historical data strictly preserved</strong>
          </span>
        </div>

        {onLiveSync && (
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="btn"
            style={{
              background: isSyncing ? 'var(--surface-raised)' : 'var(--surface)',
              color: cfg.accent,
              border: `1px solid ${cfg.accent}`,
              fontWeight: 700,
              fontSize: 12,
              padding: '7px 14px',
              borderRadius: 8,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
            id={`btn-sync-live-${platformKey}`}
          >
            <span style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }}>⚡</span>
            {isSyncing ? 'Syncing Live…' : syncSuccess ? '✓ Live Data Synced!' : `Sync Live ${cfg.label}`}
          </button>
        )}
      </div>
      {/* ── KPI Cards (Grouped or Grid) ── */}
      {cfg.groups ? (
        cfg.groups.map((g, gi) => (
          <div key={g.title} style={{ marginBottom: 18 }}>
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
        <div className="kpi-grid" style={{ marginBottom: 18 }}>{cardsFor(cfg.metrics)}</div>
      )}

      {/* ── Charts Row: Trend over time & Engagement mix ── */}
      <div className="charts-row">
        <div className="card chart-card">
          <div className="chart-head">
            <div className="chart-title">Trend over time</div>
            <select
              className="metric-select"
              value={currentMetricKey}
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
          <div className="chart-title" style={{ marginBottom: 10 }}>
            Engagement mix — this week
          </div>
          <div style={{ height: 190 }}>
            <PieChart data={pieData} colors={pieColors} labels={pieLabels} />
          </div>
          <div style={{ marginTop: 8 }}>
            {pieLabels.map((l, i) => (
              <div className="legend-row" key={l}>
                <span className="legend-dot" style={{ background: pieColors[i] }} />
                {l}
                <span className="legend-val">{fmtNum(num(curr[pieKeys[i]])) || '0'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Visitor / Exposure comparison card ── */}
      <div className="card visitor-card">
        <div className="chart-title" style={{ marginBottom: 12 }}>
          {visitorTitle}
        </div>
        <div className="vbar-row">
          <div className="vbar-label">{visitorLeftLabel}</div>
          <div className="vbar-track">
            <div
              className="vbar-fill"
              style={{ width: `${(leftVal / maxV) * 100}%`, background: cfg.accent }}
            />
          </div>
          <div className="vbar-value">{fmtNum(leftVal)}</div>
        </div>
        <div className="vbar-row" style={{ marginTop: 10 }}>
          <div className="vbar-label">{visitorRightLabel}</div>
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

