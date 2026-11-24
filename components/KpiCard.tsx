'use client';

import { getTrend, trendColors, fmtNum } from '../lib/utils';

interface Props {
  label: string;
  value: number;
  prevValue: number | null;
  sparkValues: number[];
  accent: string;
}

function SparkLine({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const w = 72;
  const h = 36;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;

  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x},${y}`;
  });

  const lastPt = pts[pts.length - 1].split(',');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" style={{ flexShrink: 0 }}>
      <polyline
        points={pts.join(' ')}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill={color} />
    </svg>
  );
}

export default function KpiCard({ label, value, prevValue, sparkValues, accent }: Props) {
  const trend = getTrend(value, prevValue);
  const tc = trendColors(trend.dir);

  return (
    <div className="card kpi-card">
      {/* Top row: dot + label */}
      <div className="kpi-top">
        <span className="kpi-dot" style={{ background: accent }} />
        <span className="kpi-label" title={label}>{label}</span>
      </div>

      {/* Middle row: big number + sparkline */}
      <div className="kpi-mid">
        <span className="kpi-value">{fmtNum(value)}</span>
        {sparkValues.length >= 2 && (
          <SparkLine values={sparkValues} color={accent} />
        )}
      </div>

      {/* Bottom: trend badge with "vs last wk" */}
      {prevValue !== null && (
        <div>
          <span className="kpi-badge" style={{ background: tc.s, color: tc.c }}>
            {tc.arrow}
            {trend.dir !== 'flat' && (
              <>{' '}{trend.pct > 0 ? '+' : ''}{trend.pct.toFixed(1)}%</>
            )}
            {trend.dir === 'flat' && <>{' '}flat</>}
            {' '}
            <span style={{ fontWeight: 400, fontFamily: 'var(--f-body)', opacity: 0.85 }}>
              vs last wk
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
