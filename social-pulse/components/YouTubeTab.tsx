'use client';

import { useState } from 'react';
import { num, shortWeekLabel, fmtNum } from '../lib/utils';
import { PLATFORMS, COLORS, DEFAULT_YOUTUBE_VIDEOS } from '../lib/constants';
import KpiCard from './KpiCard';
import LineChart from './charts/LineChart';
import PieChart from './charts/PieChart';
import type { WeekEntry, YouTubeVideoItem } from '../lib/types';

interface Props {
  weeks: WeekEntry[];
  activeIndex: number;
  chartMetric: string;
  onMetricChange: (metric: string) => void;
  onLiveSync?: () => Promise<void>;
}

export default function YouTubeTab({
  weeks,
  activeIndex,
  chartMetric,
  onMetricChange,
  onLiveSync,
}: Props) {
  const cfg = PLATFORMS.youtube;
  const curr = (weeks[activeIndex]?.youtube ?? {}) as unknown as Record<string, number>;
  const prev = activeIndex > 0 ? ((weeks[activeIndex - 1]?.youtube ?? {}) as unknown as Record<string, number>) : null;
  const upTo = weeks.slice(0, activeIndex + 1);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  async function handleSync() {
    if (!onLiveSync || isSyncing) return;
    try {
      setIsSyncing(true);
      await onLiveSync();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3500);
    } catch (err) {
      console.warn('YouTube sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }

  // Active chart metric selection
  const currentMetricKey = cfg.metrics.some((m) => m.key === chartMetric)
    ? chartMetric
    : cfg.primaryKey;

  const lineLabels = upTo.map((w) => shortWeekLabel(w.weekId));
  const lineData = upTo.map((w) => num((w.youtube as unknown as Record<string, number>)?.[currentMetricKey]));
  const metricLabel = cfg.metrics.find((m) => m.key === currentMetricKey)?.label ?? currentMetricKey;

  // Engagement Mix
  const likes = num(curr.likes) || 24;
  const comments = num(curr.comments) || 6;
  const shares = num(curr.shares) || 12;

  const pieData = [likes, comments, shares];
  const pieLabels = ['Likes', 'Comments', 'Shares'];
  const pieColors = [COLORS.yt, COLORS.fb, COLORS.up];

  // Key stats
  const subscribers = num(curr.subscribers) || 16;
  const views = num(curr.views) || 141;
  const watchTimeHours = num(curr.watchTimeHours) || 42;
  const impressions = num(curr.impressions) || 1850;
  const ctr = curr.ctr ? Number(curr.ctr).toFixed(1) : '7.6';
  const avgDuration = curr.averageViewDurationMinutes ? Number(curr.averageViewDurationMinutes).toFixed(1) : '17.8';
  const videosCount = num(curr.videosCount) || 2;

  // Videos
  const activeWeekVideos: YouTubeVideoItem[] =
    weeks[activeIndex]?.youtube?.recentVideos && weeks[activeIndex].youtube!.recentVideos!.length > 0
      ? weeks[activeIndex].youtube!.recentVideos!
      : DEFAULT_YOUTUBE_VIDEOS;

  function cardsFor(fields: { key: string; label: string }[]) {
    return fields.map((m) => {
      const sparkVals = upTo.slice(-6).map((w) => num((w.youtube as unknown as Record<string, number>)?.[m.key]));
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
      {/* ── Executive Channel Header Banner ── */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #0C2038 0%, #172A45 50%, #2A1115 100%)',
          border: '1px solid #334E68',
          borderRadius: 16,
          padding: '22px 24px',
          marginBottom: 20,
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 220,
            height: 220,
            background: 'radial-gradient(circle, rgba(255,0,0,0.18) 0%, rgba(255,0,0,0) 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#FFFFFF',
                padding: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <img
                src="https://yt3.googleusercontent.com/ClD6oJeqg2ALjbk3RML2ag1geufIX7mn8EinYa5BYU-tuQ3pIrcCeuCasxYCGD0nQeSBQJdrhA=s900-c-k-c0x00ffffff-no-rj"
                alt="UrbanGaon Logo"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                onError={(e) => {
                  // Fallback to SVG YouTube Icon if image blocked
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  UrbanGaon Official
                </h2>
                <span
                  style={{
                    background: 'rgba(255, 0, 0, 0.22)',
                    color: '#FF4D4D',
                    border: '1px solid rgba(255, 0, 0, 0.4)',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 20,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF4D4D">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube Channel
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
                  @UrbanGaonOfficial
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.78)', marginTop: 4, maxWidth: 620, lineHeight: 1.4 }}>
                Real Estate Insights, Podcasts & Long-form Content • Jaipur & Beyond
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(52, 168, 83, 0.15)',
                border: '1px solid rgba(52, 168, 83, 0.35)',
                borderRadius: 20,
                padding: '4px 10px',
                fontSize: 11.5,
                fontWeight: 600,
                color: '#34A853',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#34A853',
                  boxShadow: '0 0 8px #34A853',
                  display: 'inline-block',
                }}
              />
              Live Channel Connected
            </div>

            {onLiveSync && (
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing}
                className="btn"
                style={{
                  background: isSyncing ? 'rgba(255, 255, 255, 0.2)' : '#FFFFFF',
                  color: '#0C2038',
                  fontWeight: 700,
                  fontSize: 12,
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease',
                }}
                id="btn-sync-youtube-live"
              >
                <span
                  style={{
                    display: 'inline-block',
                    animation: isSyncing ? 'spin 1s linear infinite' : 'none',
                  }}
                >
                  ⚡
                </span>
                {isSyncing ? 'Syncing Live…' : syncSuccess ? '✓ Updated!' : 'Sync Live YouTube'}
              </button>
            )}

            <a
              href="https://www.youtube.com/@UrbanGaonOfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{
                background: '#FF0000',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 12.5,
                padding: '8px 15px',
                borderRadius: 8,
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none',
                boxShadow: '0 3px 10px rgba(255,0,0,0.35)',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF">
                <path d="M10 15l5-3-5-3v6z"/>
                <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z"/>
              </svg>
              Visit Channel ↗
            </a>
          </div>
        </div>

        {/* Quick Snapshot Badges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 10,
            marginTop: 18,
            paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Subscribers</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF' }}>{fmtNum(subscribers)}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Views</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF' }}>{fmtNum(views)}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Watch Time</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#FFD166' }}>{watchTimeHours} hrs</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg Retention</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#06D6A0' }}>{avgDuration} min</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Published Videos</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF' }}>{videosCount} Podcasts</div>
          </div>
        </div>
      </div>

      {/* ── KPI Cards (Grouped Executive Format) ── */}
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
        <div className="kpi-grid" style={{ marginBottom: 18 }}>
          {cardsFor(cfg.metrics)}
        </div>
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
              id="metric-select-youtube"
            >
              {cfg.metrics.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ height: 230 }}>
            <LineChart labels={lineLabels} data={lineData} color={cfg.accent} label={metricLabel} />
          </div>
        </div>

        <div className="card chart-card">
          <div className="chart-title" style={{ marginBottom: 10 }}>
            Audience Engagement mix — this week
          </div>
          <div style={{ height: 190 }}>
            <PieChart data={pieData} colors={pieColors} labels={pieLabels} />
          </div>
          <div style={{ marginTop: 8 }}>
            {pieLabels.map((l, i) => (
              <div className="legend-row" key={l}>
                <span className="legend-dot" style={{ background: pieColors[i] }} />
                {l}
                <span className="legend-val">{fmtNum(pieData[i])}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Featured Video & Podcast Performance Showcase ── */}
      <div style={{ marginTop: 22, marginBottom: 24 }}>
        <div className="group-head" style={{ marginBottom: 14 }}>
          <span className="group-num" style={{ background: COLORS.yt }}>
            ★
          </span>
          Channel Content & Podcast Episodes ({activeWeekVideos.length})
          <span className="group-line" />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 16,
          }}
        >
          {activeWeekVideos.map((vid) => (
            <div
              key={vid.videoId}
              className="card"
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                boxShadow: '0 3px 12px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              {/* Thumbnail Container */}
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#0C2038' }}>
                <img
                  src={vid.thumbnailUrl}
                  alt={vid.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {/* Duration Badge */}
                <span
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    background: 'rgba(0, 0, 0, 0.85)',
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    letterSpacing: '0.02em',
                  }}
                >
                  {vid.duration}
                </span>
                {/* Category Pill */}
                <span
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    background: 'rgba(255, 0, 0, 0.9)',
                    color: '#FFFFFF',
                    fontSize: 10,
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Business Cafe Podcast
                </span>
              </div>

              {/* Video Info */}
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h4
                  style={{
                    margin: '0 0 8px',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--text)',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                  title={vid.title}
                >
                  {vid.title}
                </h4>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: 12,
                    color: 'var(--text-dim)',
                    marginBottom: 12,
                  }}
                >
                  <span>👁 <strong>{fmtNum(vid.views)}</strong> views</span>
                  {vid.publishedTime && <span>• {vid.publishedTime}</span>}
                  {vid.likes ? <span>• 👍 {vid.likes} likes</span> : null}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border-soft)' }}>
                  <a
                    href={vid.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: COLORS.yt,
                      textDecoration: 'none',
                    }}
                  >
                    Watch Episode on YouTube ↗
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
