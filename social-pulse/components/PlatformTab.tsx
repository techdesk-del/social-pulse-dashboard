'use client';

import { useState, useEffect } from 'react';
import { num, shortWeekLabel, fmtNum } from '../lib/utils';
import { PLATFORMS, COLORS } from '../lib/constants';
import KpiCard from './KpiCard';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
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

  // Sub-tab selection (e.g. LinkedIn: Content, Visitors, Followers, Search Appearances | Instagram: Views, Reach, Content Interactions, Link Clicks, Visits, Follows)
  const [activeGroup, setActiveGroup] = useState<string>(cfg.groups ? cfg.groups[0].title : 'all');

  // Reset active group when switching platform
  useEffect(() => {
    if (cfg.groups && cfg.groups.length > 0) {
      setActiveGroup(cfg.groups[0].title);
      if (cfg.groups[0].fields.length > 0) {
        onMetricChange(cfg.groups[0].fields[0].key);
      }
    } else {
      setActiveGroup('all');
    }
  }, [platformKey]);

  const selectedGroupDef = cfg.groups?.find((g) => g.title.toLowerCase() === activeGroup.toLowerCase());
  const activeMetrics = selectedGroupDef ? selectedGroupDef.fields : cfg.metrics;

  // Active chart metric validation
  const currentMetricKey = activeMetrics.some((m) => m.key === chartMetric)
    ? chartMetric
    : activeMetrics[0]?.key ?? cfg.primaryKey;

  // Line chart for metric deep dive
  const lineLabels = upTo.map((w) => shortWeekLabel(w.weekId));
  const lineData = upTo.map((w) => num((w[platformKey] as unknown as Record<string, number>)[currentMetricKey]));
  const metricLabel = cfg.metrics.find((m) => m.key === currentMetricKey)?.label ?? currentMetricKey;

  // Primary metric trend line data
  const primaryTrendKey = selectedGroupDef?.fields[0]?.key ?? cfg.primaryKey;
  const primaryTrendLabel = selectedGroupDef?.fields[0]?.label ?? cfg.primaryLabel;
  const primaryLineData = upTo.map((w) => num((w[platformKey] as unknown as Record<string, number>)[primaryTrendKey]));

  // Bar chart config
  const barMetrics = activeMetrics.slice(0, 6);
  const barLabels = barMetrics.map((m) => m.label);
  const barData = barMetrics.map((m) => num(curr[m.key]));
  const barColors = barMetrics.map(() => cfg.accent);

  // Pie chart dynamic config based on platform and active sub-group
  let pieLabels: string[] = [];
  let pieColors: string[] = [];
  let pieKeys: string[] = [];

  const groupName = activeGroup.toLowerCase();

  if (platformKey === 'linkedin') {
    if (groupName === 'visitors') {
      pieLabels = ['Page Views', 'Unique Visitors', 'Custom Buttons'];
      pieColors = [cfg.accent, COLORS.flat, COLORS.textFaint];
      pieKeys = ['pageViews', 'uniqueVisitors', 'customButtonClick'];
    } else if (groupName === 'followers') {
      pieLabels = ['Total Followers', 'New Followers (300d)'];
      pieColors = [cfg.accent, COLORS.up];
      pieKeys = ['totalFollowers', 'newFollowers300Days'];
    } else if (groupName === 'search appearances') {
      pieLabels = ['Page Searches', 'Impressions'];
      pieColors = [cfg.accent, COLORS.textFaint];
      pieKeys = ['pageSearches', 'impressions'];
    } else {
      // Content or All
      pieLabels = ['Reactions', 'Comments', 'Reposts'];
      pieColors = [cfg.accent, COLORS.flat, COLORS.textFaint];
      pieKeys = ['reactions', 'comments', 'reposts'];
    }
  } else if (platformKey === 'instagram') {
    pieLabels = ['Content Interactions', 'Visits', 'Link Clicks'];
    pieColors = [COLORS.ig, COLORS.flat, COLORS.fb];
    pieKeys = ['contentInteractions', 'profileVisits', 'linkClicks'];
  } else {
    // Facebook or other
    pieLabels = ['Content Interactions', 'Link Clicks', 'Profile Visits'];
    pieColors = [cfg.accent, COLORS.flat, COLORS.textFaint];
    pieKeys = ['contentInteractions', 'linkClicks', 'profileVisits'];
  }

  const pieData = pieKeys.map((k) => num(curr[k]));

  // Ratio / Comparison card
  let compLeftKey = cfg.primaryKey;
  let compRightKey = cfg.secondaryKey;
  let compLeftLabel = cfg.primaryLabel;
  let compRightLabel = cfg.secondaryLabel;

  if (selectedGroupDef && selectedGroupDef.fields.length >= 2) {
    compLeftKey = selectedGroupDef.fields[0].key;
    compLeftLabel = selectedGroupDef.fields[0].label;
    compRightKey = selectedGroupDef.fields[1].key;
    compRightLabel = selectedGroupDef.fields[1].label;
  }

  const leftVal = num(curr[compLeftKey]);
  const rightVal = num(curr[compRightKey]);
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
      {/* ── Sub-tabs for platforms with categories (LinkedIn & Instagram sub-tabs) ── */}
      {cfg.groups && (
        <div className="tab-pills" style={{ marginTop: 2, marginBottom: 18 }}>
          {cfg.groups.map((g) => {
            const active = activeGroup.toLowerCase() === g.title.toLowerCase();
            return (
              <button
                key={g.title}
                type="button"
                id={`subtab-${platformKey}-${g.title.toLowerCase().replace(/\s+/g, '-')}`}
                className={`pill-btn${active ? ' active' : ''}`}
                style={active ? { color: cfg.accent, borderColor: cfg.accent, fontWeight: 700 } : {}}
                onClick={() => {
                  setActiveGroup(g.title);
                  if (g.fields.length > 0) {
                    onMetricChange(g.fields[0].key);
                  }
                }}
              >
                <span className="pill-dot" style={{ background: cfg.accent }} />
                {g.title}
              </button>
            );
          })}
          <button
            type="button"
            id={`subtab-${platformKey}-all`}
            className={`pill-btn${activeGroup === 'all' ? ' active' : ''}`}
            style={activeGroup === 'all' ? { color: cfg.accent, borderColor: cfg.accent, fontWeight: 700 } : {}}
            onClick={() => setActiveGroup('all')}
          >
            <span className="pill-dot" style={{ background: cfg.accent }} />
            All Details
          </button>
        </div>
      )}

      {/* ── KPI Cards ── */}
      {cfg.groups ? (
        activeGroup === 'all' ? (
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
          <div className="kpi-grid" style={{ marginBottom: 18 }}>
            {cardsFor(activeMetrics)}
          </div>
        )
      ) : (
        <div className="kpi-grid">{cardsFor(cfg.metrics)}</div>
      )}

      {/* ── Top Row: 3 Synced Platform Charts ── */}
      <div className="charts-row-3">
        <div className="card chart-card">
          <div className="chart-title" style={{ marginBottom: 10 }}>
            {selectedGroupDef ? `${selectedGroupDef.title} metrics` : `${cfg.label} metrics`} — this week
          </div>
          <div style={{ height: 190 }}>
            <BarChart labels={barLabels} data={barData} colors={barColors} />
          </div>
        </div>

        <div className="card chart-card">
          <div className="chart-title" style={{ marginBottom: 10 }}>
            {selectedGroupDef ? `${selectedGroupDef.title} distribution` : 'Engagement mix'} — this week
          </div>
          <div style={{ height: 170 }}>
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

        <div className="card chart-card">
          <div className="chart-title" style={{ marginBottom: 10 }}>
            {primaryTrendLabel} trend — all weeks
          </div>
          <div style={{ height: 190 }}>
            <LineChart labels={lineLabels} data={primaryLineData} color={cfg.accent} label={primaryTrendLabel} />
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Metric Deep-Dive & Exposure Ratio ── */}
      <div className="charts-row">
        <div className="card chart-card">
          <div className="chart-head">
            <div className="chart-title">Metric Deep-Dive</div>
            <select
              className="metric-select"
              value={currentMetricKey}
              onChange={(e) => onMetricChange(e.target.value)}
              id={`metric-select-${platformKey}`}
            >
              {activeMetrics.map((m) => (
                <option key={m.key} value={m.key}>{m.label}</option>
              ))}
            </select>
          </div>
          <div style={{ height: 210 }}>
            <LineChart labels={lineLabels} data={lineData} color={cfg.accent} label={metricLabel} />
          </div>
        </div>

        <div className="card visitor-card">
          <div className="chart-title" style={{ marginBottom: 16 }}>
            {`${compLeftLabel} vs. ${compRightLabel}`}
          </div>
          <div className="vbar-row">
            <div className="vbar-label">{compLeftLabel}</div>
            <div className="vbar-track">
              <div
                className="vbar-fill"
                style={{ width: `${(leftVal / maxV) * 100}%`, background: cfg.accent }}
              />
            </div>
            <div className="vbar-value">{fmtNum(leftVal)}</div>
          </div>
          {compRightKey !== compLeftKey && (
            <div className="vbar-row" style={{ marginTop: 14 }}>
              <div className="vbar-label">{compRightLabel}</div>
              <div className="vbar-track">
                <div
                  className="vbar-fill"
                  style={{ width: `${(rightVal / maxV) * 100}%`, background: COLORS.textFaint }}
                />
              </div>
              <div className="vbar-value">{fmtNum(rightVal)}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
