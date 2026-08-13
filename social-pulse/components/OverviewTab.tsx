'use client';

import { num, shortWeekLabel } from '../lib/utils';
import { COLORS } from '../lib/constants';
import KpiCard from './KpiCard';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import PieChart from './charts/PieChart';
import type { WeekEntry } from '../lib/types';

interface Props {
  weeks: WeekEntry[];
  activeIndex: number;
}

export default function OverviewTab({ weeks, activeIndex }: Props) {
  const curr = weeks[activeIndex];
  const prev = activeIndex > 0 ? weeks[activeIndex - 1] : null;
  const upTo = weeks.slice(0, activeIndex + 1);

  const totalReach = num(curr.linkedin.impressions) + num(curr.instagram.reach) + num(curr.facebook.viewers);
  const prevReach = prev ? num(prev.linkedin.impressions) + num(prev.instagram.reach) + num(prev.facebook.viewers) : null;

  const totalEng =
    num(curr.linkedin.reactions) + num(curr.linkedin.comments) + num(curr.linkedin.reposts) +
    num(curr.instagram.contentInteractions) + num(curr.facebook.contentInteractions);
  const prevEng = prev
    ? num(prev.linkedin.reactions) + num(prev.linkedin.comments) + num(prev.linkedin.reposts) +
      num(prev.instagram.contentInteractions) + num(prev.facebook.contentInteractions)
    : null;

  const totalNewFollows = num(curr.linkedin.newFollowers) + num(curr.instagram.follows) + num(curr.facebook.follows);
  const prevNewFollows = prev
    ? num(prev.linkedin.newFollowers) + num(prev.instagram.follows) + num(prev.facebook.follows)
    : null;

  const totalClicks = num(curr.instagram.linkClicks) + num(curr.facebook.linkClicks);
  const prevClicks = prev ? num(prev.instagram.linkClicks) + num(prev.facebook.linkClicks) : null;

  function sparkFor(fn: (w: WeekEntry) => number) {
    return upTo.slice(-6).map(fn);
  }

  const lineLabels = upTo.map((w) => shortWeekLabel(w.weekId));
  const lineData = upTo.map((w) => num(w.linkedin.newFollowers) + num(w.instagram.follows) + num(w.facebook.follows));

  const barNames = ['LinkedIn', 'Instagram', 'Facebook'];
  const barColors = [COLORS.li, COLORS.ig, COLORS.fb];
  const barVals = [num(curr.linkedin.newFollowers), num(curr.instagram.follows), num(curr.facebook.follows)];
  const reachVals = [num(curr.linkedin.impressions), num(curr.instagram.reach), num(curr.facebook.viewers)];

  return (
    <>
      <div className="kpi-grid">
        <KpiCard
          label="Total Exposure (LI Impr. + IG Reach + FB Viewers)"
          value={totalReach}
          prevValue={prevReach}
          sparkValues={sparkFor((w) => num(w.linkedin.impressions) + num(w.instagram.reach) + num(w.facebook.viewers))}
          accent={COLORS.text}
        />
        <KpiCard
          label="Total Engagement"
          value={totalEng}
          prevValue={prevEng}
          sparkValues={sparkFor((w) =>
            num(w.linkedin.reactions) + num(w.linkedin.comments) + num(w.linkedin.reposts) +
            num(w.instagram.contentInteractions) + num(w.facebook.contentInteractions)
          )}
          accent={COLORS.up}
        />
        <KpiCard
          label="New Follows This Week"
          value={totalNewFollows}
          prevValue={prevNewFollows}
          sparkValues={sparkFor((w) => num(w.linkedin.newFollowers) + num(w.instagram.follows) + num(w.facebook.follows))}
          accent={COLORS.flat}
        />
        <KpiCard
          label="Total Link Clicks (Meta)"
          value={totalClicks}
          prevValue={prevClicks}
          sparkValues={sparkFor((w) => num(w.instagram.linkClicks) + num(w.facebook.linkClicks))}
          accent={COLORS.fb}
        />
      </div>

      <div className="charts-row-3">
        <div className="card chart-card">
          <div className="chart-title" style={{ marginBottom: 10 }}>New follows by platform — this week</div>
          <div style={{ height: 190 }}>
            <BarChart labels={barNames} data={barVals} colors={barColors} />
          </div>
        </div>
        <div className="card chart-card">
          <div className="chart-title" style={{ marginBottom: 10 }}>Reach share by platform</div>
          <div style={{ height: 190 }}>
            <PieChart data={reachVals} colors={barColors} labels={barNames} />
          </div>
        </div>
        <div className="card chart-card">
          <div className="chart-title" style={{ marginBottom: 10 }}>Weekly new follows — all weeks</div>
          <div style={{ height: 190 }}>
            <LineChart labels={lineLabels} data={lineData} color={COLORS.up} label="New follows" />
          </div>
        </div>
      </div>
    </>
  );
}
