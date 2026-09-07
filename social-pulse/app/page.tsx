'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { emptyLinkedIn, emptyInstagram, emptyFacebook, emptyGoogleReviews, emptyYouTube, SEED_WEEKS } from '../lib/constants';
import { exportPDF } from '../lib/exportPdf';
import { normalizeImportedWeeks, mergeWeekEntries, parseWeekRange } from '../lib/utils';
import type { WeekEntry, TabId, PlatformKey, AppState, LinkedInData, InstagramData, FacebookData, GoogleReviewsData, YouTubeData } from '../lib/types';

import Header from '../components/Header';
import PulseBar from '../components/PulseBar';
import Tabs, { TAB_DEFS } from '../components/Tabs';
import OverviewTab from '../components/OverviewTab';
import PlatformTab from '../components/PlatformTab';
import GoogleReviewsTab from '../components/GoogleReviewsTab';
import YouTubeTab from '../components/YouTubeTab';
import CompareTab from '../components/CompareTab';
import DataModal from '../components/DataModal';

const STORAGE_KEY = 'social_pulse_weeks_store_v8';

const INITIAL_STATE: Omit<AppState, 'weeks'> = {
  activeIndex: 0,
  tab: 'overview',
  compareTab: 'linkedin',
  chartMetric: { linkedin: 'impressions', instagram: 'views', facebook: 'views', google: 'totalReviews', youtube: 'views' },
  formOpen: false,
  formWeekId: null,
  formSection: 'linkedin',
  _newWeekDate: null,
};


function saveToLocalStorage(data: WeekEntry[]) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.removeItem('social_pulse_weeks_store_v2');
      localStorage.removeItem('social_pulse_weeks_store_v3');
      localStorage.removeItem('social_pulse_weeks_store_v4');
      localStorage.removeItem('social_pulse_weeks_store_v6');
      localStorage.removeItem('social-pulse-weeks-v3');
    }
  } catch (err) {
    console.warn('Failed to save to localStorage', err);
  }
}

function loadFromLocalStorage(): WeekEntry[] | null {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('social_pulse_weeks_store_v2');
      localStorage.removeItem('social_pulse_weeks_store_v3');
      localStorage.removeItem('social_pulse_weeks_store_v4');
      localStorage.removeItem('social_pulse_weeks_store_v6');
      localStorage.removeItem('social-pulse-weeks-v3');

      const item = localStorage.getItem(STORAGE_KEY);
      if (item !== null) {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to read from localStorage', err);
  }
  return null;
}

export default function DashboardPage() {
  const { session, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [weeks, setWeeks] = useState<WeekEntry[]>(SEED_WEEKS);
  const [state, setState] = useState<Omit<AppState, 'weeks'>>({
    ...INITIAL_STATE,
    activeIndex: SEED_WEEKS.length - 1,
  });
  const [isReady, setIsReady] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Guard: if not authenticated, redirect to /login
  useEffect(() => {
    if (!authLoading && !session) {
      router.replace('/login');
    }
  }, [session, authLoading, router]);

  // ── Real-Time Google Live Sync ──
  const handleLiveGoogleSync = useCallback(async () => {
    try {
      const res = await fetch('/api/google-reviews/live?sync=true');
      const json = await res.json();
      if (json.ok && json.data) {
        const live = json.data;
        setWeeks((prev) => {
          if (prev.length === 0) return prev;
          const updated = prev.map((w, idx) => {
            const currentGoogle = w.google || emptyGoogleReviews();
            return {
              ...w,
              google: {
                ...currentGoogle,
                averageRating: live.rating ?? currentGoogle.averageRating,
                totalReviews: live.totalReviews ?? currentGoogle.totalReviews,
                newReviews: live.newReviewsThisWeek ?? currentGoogle.newReviews,
                responseRate: live.responseRate ?? currentGoogle.responseRate,
                fiveStars: live.fiveStars ?? currentGoogle.fiveStars,
                fourStars: live.fourStars ?? currentGoogle.fourStars,
                threeStars: live.threeStars ?? currentGoogle.threeStars,
                twoStars: live.twoStars ?? currentGoogle.twoStars,
                oneStar: live.oneStar ?? currentGoogle.oneStar,
                searchViews: live.searchViews ?? currentGoogle.searchViews,
                mapsViews: live.mapsViews ?? currentGoogle.mapsViews,
                websiteClicks: live.websiteClicks ?? currentGoogle.websiteClicks,
                directionRequests: live.directionRequests ?? currentGoogle.directionRequests,
                callClicks: live.callClicks ?? currentGoogle.callClicks,
                recentReviews: live.recentReviews && live.recentReviews.length > 0 ? live.recentReviews : currentGoogle.recentReviews,
              },
            };
          });
          saveToLocalStorage(updated);
          return updated;
        });
      }
    } catch (err) {
      console.warn('Live Google sync note:', err);
    }
  }, []);

  // ── Real-Time YouTube Live Sync ──
  const handleLiveYouTubeSync = useCallback(async () => {
    try {
      const res = await fetch('/api/youtube/live?sync=true');
      const json = await res.json();
      if (json.ok && json.data) {
        const live = json.data;
        setWeeks((prev) => {
          if (prev.length === 0) return prev;
          const updated = prev.map((w) => {
            const currentYt = w.youtube || emptyYouTube();
            return {
              ...w,
              youtube: {
                ...currentYt,
                subscribers: live.subscribers ?? currentYt.subscribers,
                views: live.views ?? currentYt.views,
                watchTimeHours: live.watchTimeHours ?? currentYt.watchTimeHours,
                likes: live.likes ?? currentYt.likes,
                videosCount: live.videosCount ?? currentYt.videosCount,
                recentVideos: live.recentVideos && live.recentVideos.length > 0 ? live.recentVideos : currentYt.recentVideos,
              },
            };
          });
          saveToLocalStorage(updated);
          return updated;
        });
      }
    } catch (err) {
      console.warn('Live YouTube sync note:', err);
    }
  }, []);

  // Sync function to pull latest live database entries
  const syncWithDatabase = useCallback(async () => {
    try {
      const res = await fetch('/api/weeks');
      const data = await res.json();
      if (data.ok && Array.isArray(data.weeks) && data.weeks.length > 0) {
        setWeeks(data.weeks);
        saveToLocalStorage(data.weeks);
      }
      await Promise.allSettled([handleLiveGoogleSync(), handleLiveYouTubeSync()]);
    } catch (err) {
      console.warn('Database sync note:', err);
    }
  }, [handleLiveGoogleSync, handleLiveYouTubeSync]);

  // Initialize data on mount: show local cache immediately, then sync with live MongoDB & Google
  useEffect(() => {
    const local = loadFromLocalStorage();
    if (local !== null && local.length > 0) {
      setWeeks(local);
      setIsReady(true);
    } else {
      setWeeks(SEED_WEEKS);
      saveToLocalStorage(SEED_WEEKS);
      setIsReady(true);
    }

    // Always fetch latest live weeks from MongoDB and live Google Places API
    syncWithDatabase().finally(() => {
      setIsReady(true);
    });

    // Automatically re-sync whenever user focuses or returns to the dashboard tab
    const handleFocus = () => syncWithDatabase();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') syncWithDatabase();
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [syncWithDatabase]);

  const activeIndex = Math.min(state.activeIndex, Math.max(0, weeks.length - 1));
  const activeWeek = weeks[activeIndex];
  const activeAccent = TAB_DEFS.find((t) => t.id === state.tab)?.accent ?? '#0C2038';

  // ── Tab / Week navigation ──
  const selectTab = (id: TabId) => setState((s) => ({ ...s, tab: id }));
  const selectWeek = (i: number) => setState((s) => ({ ...s, activeIndex: i }));
  const setCompareTab = (pk: PlatformKey) => setState((s) => ({ ...s, compareTab: pk }));
  const setChartMetric = (platformKey: PlatformKey, metric: string) =>
    setState((s) => ({ ...s, chartMetric: { ...s.chartMetric, [platformKey]: metric } }));

  // ── Modal control ──
  const openForm = (targetWeekId?: string | null) => {
    const weekToEdit = targetWeekId !== undefined ? targetWeekId : (weeks[activeIndex]?.weekId ?? null);
    setState((s) => ({
      ...s,
      formOpen: true,
      formWeekId: weekToEdit,
      _newWeekDate: null,
      formSection: ['linkedin', 'instagram', 'facebook', 'google', 'youtube'].includes(s.tab) ? s.tab : 'linkedin',
    }));
  };

  const closeForm = () => setState((s) => ({ ...s, formOpen: false }));

  const selectFormWeek = (val: string) => {
    setState((s) => ({ ...s, formWeekId: val === '__new__' ? null : val }));
  };

  const setFormWeekDate = (val: string) => setState((s) => ({ ...s, _newWeekDate: val }));
  const toggleFormSection = (id: string) =>
    setState((s) => ({ ...s, formSection: s.formSection === id ? null : id }));

  // ── Save Week: Persistent in localStorage & MongoDB ──
  const saveWeek = useCallback(
    async (
      weekId: string,
      data: { linkedin: LinkedInData; instagram: InstagramData; facebook: FacebookData; google: GoogleReviewsData; youtube: YouTubeData }
    ) => {
      const entry: WeekEntry = {
        weekId,
        linkedin: { ...emptyLinkedIn(), ...data.linkedin },
        instagram: { ...emptyInstagram(), ...data.instagram },
        facebook: { ...emptyFacebook(), ...data.facebook },
        google: { ...emptyGoogleReviews(), ...data.google },
        youtube: { ...emptyYouTube(), ...data.youtube },
      };

      // 1. Update state and localStorage immediately
      const idx = weeks.findIndex((w) => w.weekId === weekId);
      let updatedList: WeekEntry[];
      if (idx >= 0) {
        updatedList = [...weeks];
        updatedList[idx] = entry;
      } else {
        updatedList = mergeWeekEntries(weeks, [entry]);
      }

      setWeeks(updatedList);
      saveToLocalStorage(updatedList);

      const newActiveIdx = updatedList.findIndex((w) => w.weekId === weekId);
      setState((s) => ({ ...s, activeIndex: newActiveIdx >= 0 ? newActiveIdx : updatedList.length - 1, formOpen: false }));

      // 2. Sync to MongoDB in background
      try {
        await fetch('/api/weeks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
      } catch (err) {
        console.warn('MongoDB sync note:', err);
      }
    },
    [weeks]
  );




  // ── Delete Week: Permanently removes from state, localStorage & MongoDB ──
  const deleteWeek = useCallback(
    async (weekId: string) => {
      const updatedList = weeks.filter((w) => w.weekId !== weekId && parseWeekRange(w.weekId).start !== parseWeekRange(weekId).start);
      const nextActiveIdx = Math.max(0, updatedList.length - 1);

      // 1. Immediately update state & localStorage
      setWeeks(updatedList);
      saveToLocalStorage(updatedList);
      setState((s) => ({ ...s, activeIndex: nextActiveIdx, formOpen: false }));

      // 2. Sync deletion to MongoDB
      try {
        await fetch(`/api/weeks?weekId=${encodeURIComponent(weekId)}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.warn('MongoDB delete sync note:', err);
      }
    },
    [weeks]
  );

  // ── PDF Export ──
  const handleExportPdf = async () => {
    if (weeks.length === 0) {
      alert('No weeks available to export.');
      return;
    }
    setPdfLoading(true);
    try {
      await exportPDF(weeks, activeIndex);
    } catch (err) {
      console.error('PDF export failed', err);
      alert('PDF export failed. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  // ── JSON Import ──
  const handleImport = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const fileList = Array.from(files);
      const allIncomingWeeks: WeekEntry[] = [];

      for (const file of fileList) {
        const text = await file.text();
        const json = JSON.parse(text);
        const parsed = normalizeImportedWeeks(json);
        if (parsed.length > 0) {
          allIncomingWeeks.push(...parsed);
        }
      }

      if (allIncomingWeeks.length === 0) {
        alert('No valid week entries could be extracted from the selected JSON file(s). Please verify the JSON structure.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setWeeks((prevWeeks) => {
        const merged = mergeWeekEntries(prevWeeks, allIncomingWeeks);
        saveToLocalStorage(merged);

        // Highlight the latest imported week
        const latestIncoming = allIncomingWeeks[allIncomingWeeks.length - 1];
        const targetIdx = merged.findIndex(
          (w) => w.weekId === latestIncoming.weekId || parseWeekRange(w.weekId).start === parseWeekRange(latestIncoming.weekId).start
        );
        setState((s) => ({ ...s, activeIndex: targetIdx >= 0 ? targetIdx : merged.length - 1 }));

        // Sync with cloud database in background
        fetch('/api/weeks/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weeks: merged }),
        }).catch((err) => console.warn('Cloud sync error on import:', err));

        return merged;
      });

      alert(`Successfully imported ${allIncomingWeeks.length} week(s) across ${fileList.length} file(s)!`);
    } catch (err) {
      console.error('Import failed:', err);
      alert("Couldn't read file(s) — please make sure they contain valid JSON format.");
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (authLoading || !session || !isReady) {
    return (
      <div className="auth-page">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="auth-logo-icon" style={{ width: 56, height: 56 }}>
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <path d="M6 20 L10 10 L14 15 L18 8 L22 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--f-mono)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
            Loading Social Pulse Dashboard…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="app-root">
      <Header
        activeWeek={activeWeek}
        session={session}
        onLogout={logout}
        onImport={handleImport}
        onExportPdf={handleExportPdf}
        onAdd={() => openForm()}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        pdfLoading={pdfLoading}
      />

      <PulseBar
        weeks={weeks}
        activeIndex={activeIndex}
        accent={activeAccent}
        onSelectWeek={selectWeek}
      />

      {weeks.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '50px 24px',
            textAlign: 'center',
            margin: '36px auto',
            maxWidth: 580,
            border: '2px dashed var(--border)',
            borderRadius: 16,
            background: 'var(--surface)',
          }}
        >
          <div style={{ fontSize: 42, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>
            No weeks saved yet
          </div>
          <div style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 24, lineHeight: 1.6, maxWidth: 440, margin: '0 auto 24px' }}>
            You haven't added any weekly performance metrics yet. Click the button below to add your first week.
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ margin: '0 auto', padding: '12px 28px', fontSize: 14.5, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            onClick={() => openForm(null)}
            id="btn-add-first-week"
          >
            + Add Your First Week
          </button>
        </div>
      ) : (
        <>
          <Tabs activeTab={state.tab} onSelectTab={selectTab} />

          <div id="tab-body">
            {state.tab === 'overview' && (
              <OverviewTab weeks={weeks} activeIndex={activeIndex} />
            )}
            {(state.tab === 'linkedin' || state.tab === 'instagram' || state.tab === 'facebook') && (
              <PlatformTab
                key={state.tab}
                platformKey={state.tab}
                weeks={weeks}
                activeIndex={activeIndex}
                chartMetric={state.chartMetric[state.tab]}
                onMetricChange={(metric) => setChartMetric(state.tab as PlatformKey, metric)}
              />
            )}
            {state.tab === 'google' && (
              <GoogleReviewsTab
                weeks={weeks}
                activeIndex={activeIndex}
                chartMetric={state.chartMetric.google || 'totalReviews'}
                onMetricChange={(metric) => setChartMetric('google', metric)}
                onLiveSync={handleLiveGoogleSync}
              />
            )}
            {state.tab === 'youtube' && (
              <YouTubeTab
                weeks={weeks}
                activeIndex={activeIndex}
                chartMetric={state.chartMetric.youtube || 'views'}
                onMetricChange={(metric) => setChartMetric('youtube', metric)}
                onLiveSync={handleLiveYouTubeSync}
              />
            )}
            {state.tab === 'compare' && (
              <CompareTab
                weeks={weeks}
                compareTab={state.compareTab}
                onSetCompareTab={setCompareTab}
              />
            )}
          </div>
        </>
      )}


      <div className="footnote">
        All changes are <b>automatically saved</b> in your browser and synced with the cloud database.
      </div>

      {state.formOpen && (
        <DataModal
          weeks={weeks}
          formWeekId={state.formWeekId}
          formSection={state.formSection}
          newWeekDate={state._newWeekDate}
          onClose={closeForm}
          onSelectFormWeek={selectFormWeek}
          onSetFormWeekDate={setFormWeekDate}
          onToggleSection={toggleFormSection}
          onSave={saveWeek}
          onDelete={deleteWeek}
        />
      )}
    </div>
  );
}
