'use client';

import { Fragment } from 'react';
import { num, fmtNum, formatWeekLabel, getTrend, trendColors } from '../lib/utils';
import { PLATFORMS } from '../lib/constants';
import type { WeekEntry, PlatformKey } from '../lib/types';

interface Props {
  weeks: WeekEntry[];
  compareTab: PlatformKey;
  onSetCompareTab: (pk: PlatformKey) => void;
}

export default function CompareTab({ weeks, compareTab, onSetCompareTab }: Props) {
  const cfg = PLATFORMS[compareTab];

  function rowsForFields(fields: { key: string; label: string }[]) {
    return fields.map((f) => (
      <tr key={f.key}>
        <td>{f.label}</td>
        {weeks.map((w, i) => {
          const val = num((w[compareTab] as unknown as Record<string, number>)[f.key]);
          const prevVal = i > 0 ? num((weeks[i - 1][compareTab] as unknown as Record<string, number>)[f.key]) : null;
          const trend = getTrend(val, prevVal);
          const tc = trendColors(trend.dir);
          return (
            <td key={w.weekId}>
              <span className="cell-val">{fmtNum(val)}</span>
              {i > 0 && (
                <span
                  className="cell-delta"
                  style={{ background: tc.s, color: tc.c }}
                >
                  {tc.arrow}
                  {trend.pct !== 0 && ` ${trend.pct > 0 ? '+' : ''}${trend.pct.toFixed(0)}%`}
                </span>
              )}
            </td>
          );
        })}
      </tr>
    ));
  }

  return (
    <>
      <div className="tab-pills">
        {(['linkedin', 'instagram', 'facebook', 'google', 'youtube'] as PlatformKey[]).map((pk) => {
          const p = PLATFORMS[pk];
          const active = compareTab === pk;
          return (
            <button
              key={pk}
              id={`pill-${pk}`}
              className={`pill-btn${active ? ' active' : ''}`}
              style={active ? { color: p.accent, borderColor: p.accent } : {}}
              onClick={() => onSetCompareTab(pk)}
            >
              <span className="pill-dot" style={{ background: p.accent }} />
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="compare-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th>Metric</th>
              {weeks.map((w) => (
                <th key={w.weekId}>{formatWeekLabel(w.weekId)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cfg.groups ? (
              cfg.groups.map((g) => (
                <Fragment key={g.title}>
                  <tr className="group-row">
                    <td colSpan={weeks.length + 1}>{g.title}</td>
                  </tr>
                  {rowsForFields(g.fields)}
                </Fragment>
              ))
            ) : (
              rowsForFields(cfg.metrics)
            )}
          </tbody>
        </table>
      </div>

      <div className="footnote" style={{ textAlign: 'left', marginTop: 14 }}>
        Every saved week stays in this table — adding or editing a week never removes another.
        Arrows compare each cell to the week directly before it.
      </div>
    </>
  );
}
