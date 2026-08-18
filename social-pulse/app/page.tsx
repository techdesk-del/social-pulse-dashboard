'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { emptyLinkedIn, emptyInstagram, emptyFacebook, SEED_WEEKS } from '../lib/constants';
import { exportPDF } from '../lib/exportPdf';
import type { WeekEntry, TabId, PlatformKey, AppState, FormDraft } from '../lib/types';

import Header from '../components/Header';
import PulseBar from '../components/PulseBar';
import Tabs, { TAB_DEFS } from '../components/Tabs';
import OverviewTab from '../components/OverviewTab';
import PlatformTab from '../components/PlatformTab';
import CompareTab from '../components/CompareTab';
import DataModal from '../components/DataModal';

const STORAGE_KEY = 'social_pulse_weeks_store_v2';

const INITIAL_STATE: Omit<AppState, 'weeks'> = {
  activeIndex: 0,
  tab: 'overview',
  compareTab: 'linkedin',
  chartMetric: { linkedin: 'impressions', instagram: 'impressions', facebook: 'views' },
  formOpen: false,
  formWeekId: null,
  formSection: 'linkedin',
  _newWeekDate: null,
};

function saveToLocalStorage(data: WeekEntry[]) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (err) {
    console.warn('Failed to save to localStorage', err);
  }
}

function loadFromLocalStorage(): WeekEntry[] | null {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(STORAGE_KEY);
      if (item) {
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
  const [weeks, setWeeks] = useState<WeekEntry[]>([]);
  const [state, setState] = useState<Omit<AppState, 'weeks'>>(INITIAL_STATE);
  const [draft, setDraft] = useState<FormDraft>({ linkedin: null, instagram: null, facebook: null });
  const [isReady, setIsReady] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize data on mount: First localStorage (instant), then background sync with MongoDB
  useEffect(() => {
    const local = loadFromLocalStorage();
    if (local && local.length > 0) {
      setWeeks(local);
      setIsReady(true);
    }

    // Fetch from MongoDB
    fetch('/api/weeks')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.weeks) && data.weeks.length > 0) {
          if (!local || local.length === 0) {
            setWeeks(data.weeks);
            saveToLocalStorage(data.weeks);
          }
        } else if (!local) {
          setWeeks(SEED_WEEKS);
          saveToLocalStorage(SEED_WEEKS);
        }
      })
      .catch((err) => {
        console.warn('Database fetch warning, using local data:', err);
        if (!local) {
          setWeeks(SEED_WEEKS);
          saveToLocalStorage(SEED_WEEKS);
        }
      })
      .finally(() => {
        setIsReady(true);
      });
  }, []);

  const activeIndex = Math.min(state.activeIndex, Math.max(0, weeks.length - 1));
  const activeWeek = weeks[activeIndex] ?? weeks[0] ?? SEED_WEEKS[0];
  const activeAccent = TAB_DEFS.find((t) => t.id === state.tab)?.accent ?? '#0C2038';

  // ── Tab / Week navigation ──
  const selectTab = (id: TabId) => setState((s) => ({ ...s, tab: id }));
  const selectWeek = (i: number) => setState((s) => ({ ...s, activeIndex: i }));
  const setCompareTab = (pk: PlatformKey) => setState((s) => ({ ...s, compareTab: pk }));
  const setChartMetric = (platformKey: PlatformKey, metric: string) =>
    setState((s) => ({ ...s, chartMetric: { ...s.chartMetric, [platformKey]: metric } }));

  // ── Modal control ──
  const openForm = () => {
    setDraft({ linkedin: null, instagram: null, facebook: null });
    setState((s) => ({ ...s, formOpen: true, formWeekId: null, _newWeekDate: null, formSection: 'linkedin' }));
  };
  const closeForm = () => setState((s) => ({ ...s, formOpen: false }));

  const selectFormWeek = (val: string) => {
    setDraft({ linkedin: null, instagram: null, facebook: null });
    setState((s) => ({ ...s, formWeekId: val === '__new__' ? null : val }));
  };

  const setFormWeekDate = (val: string) => setState((s) => ({ ...s, _newWeekDate: val }));
  const toggleFormSection = (id: string) =>
    setState((s) => ({ ...s, formSection: s.formSection === id ? null : id }));

  // ── Save Week: Persistent in localStorage & MongoDB ──
  const saveWeek = useCallback(
    async (weekId: string, savedDraft: FormDraft) => {
      const existing = weeks.find((w) => w.weekId === weekId);
      const entry: WeekEntry = {
        weekId,
        linkedin: { ...emptyLinkedIn(), ...(existing?.linkedin ?? {}), ...(savedDraft.linkedin ?? {}) } as WeekEntry['linkedin'],
        instagram: { ...emptyInstagram(), ...(existing?.instagram ?? {}), ...(savedDraft.instagram ?? {}) } as WeekEntry['instagram'],
        facebook: { ...emptyFacebook(), ...(existing?.facebook ?? {}), ...(savedDraft.facebook ?? {}) } as WeekEntry['facebook'],
      };

      // 1. Immediately update state and localStorage for instantaneous persistence
      const idx = weeks.findIndex((w) => w.weekId === weekId);
      let updatedList: WeekEntry[];
      if (idx >= 0) {
        updatedList = [...weeks];
        updatedList[idx] = entry;
      } else {
        updatedList = [...weeks, entry].sort((a, b) => a.weekId.localeCompare(b.weekId));
      }

      setWeeks(updatedList);
      saveToLocalStorage(updatedList);

      const newActiveIdx = updatedList.findIndex((w) => w.weekId === weekId);
      setState((s) => ({ ...s, activeIndex: newActiveIdx, formOpen: false }));

      // 2. Sync to MongoDB in background
      try {
        await fetch('/api/weeks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
      } catch (err) {
        console.warn('MongoDB sync note: Saved locally, remote sync error:', err);
      }
    },
    [weeks]
  );

  // ── Delete Week: Persistent in localStorage & MongoDB ──
  const deleteWeek = useCallback(
    async (weekId: string) => {
      const idx = weeks.findIndex((w) => w.weekId === weekId);
      const updatedList = weeks.filter((w) => w.weekId !== weekId);
      const nextActiveIdx = Math.max(0, Math.min(idx, updatedList.length - 1));

      // 1. Immediately update state & localStorage
      setWeeks(updatedList);
      saveToLocalStorage(updatedList);
      setState((s) => ({ ...s, activeIndex: nextActiveIdx, formOpen: false }));

      // 2. Sync to MongoDB in background
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
    setPdfLoading(true);
    try {
      await exportPDF(weeks.length > 0 ? weeks : SEED_WEEKS, activeIndex);
    } catch (err) {
      console.error('PDF export failed', err);
      alert('PDF export failed. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  // ── JSON Import (Saves to localStorage & MongoDB) ──
  const handleImport = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string) as WeekEntry[];
        if (!Array.isArray(imported)) throw new Error('not an array');

        // Merge with existing weeks
        const map = new Map<string, WeekEntry>();
        weeks.forEach((w) => map.set(w.weekId, w));
        imported.forEach((w) => {
          if (w && w.weekId) map.set(w.weekId, w);
        });

        const merged = Array.from(map.values()).sort((a, b) => a.weekId.localeCompare(b.weekId));
        setWeeks(merged);
        saveToLocalStorage(merged);
        setState((s) => ({ ...s, activeIndex: merged.length - 1 }));

        // Sync to MongoDB
        fetch('/api/weeks/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weeks: imported }),
        }).catch(console.warn);

        alert(`Successfully imported ${imported.length} week(s)!`);
      } catch {
        alert("Couldn't read that file — make sure it's a valid JSON file.");
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  if (!isReady && weeks.length === 0) {
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

  const displayWeeks = weeks.length > 0 ? weeks : SEED_WEEKS;

  return (
    <div id="app-root">
      <Header
        activeWeek={activeWeek}
        onImport={handleImport}
        onExportPdf={handleExportPdf}
        onAdd={openForm}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        pdfLoading={pdfLoading}
      />

      <PulseBar
        weeks={displayWeeks}
        activeIndex={activeIndex}
        accent={activeAccent}
        onSelectWeek={selectWeek}
      />

      <Tabs activeTab={state.tab} onSelectTab={selectTab} />

      <div id="tab-body">
        {state.tab === 'overview' && (
          <OverviewTab weeks={displayWeeks} activeIndex={activeIndex} />
        )}
        {(state.tab === 'linkedin' || state.tab === 'instagram' || state.tab === 'facebook') && (
          <PlatformTab
            key={state.tab}
            platformKey={state.tab}
            weeks={displayWeeks}
            activeIndex={activeIndex}
            chartMetric={state.chartMetric[state.tab]}
            onMetricChange={(metric) => setChartMetric(state.tab as PlatformKey, metric)}
          />
        )}
        {state.tab === 'compare' && (
          <CompareTab
            weeks={displayWeeks}
            compareTab={state.compareTab}
            onSetCompareTab={setCompareTab}
          />
        )}
      </div>

      <div className="footnote">
        All changes are <b>automatically saved</b> in your browser and synced with the cloud database.
      </div>

      {state.formOpen && (
        <DataModal
          weeks={displayWeeks}
          formWeekId={state.formWeekId}
          formSection={state.formSection}
          newWeekDate={state._newWeekDate}
          draft={draft}
          onClose={closeForm}
          onSelectFormWeek={selectFormWeek}
          onSetFormWeekDate={setFormWeekDate}
          onToggleSection={toggleFormSection}
          onSave={saveWeek}
          onDelete={deleteWeek}
          onDraftChange={setDraft}
        />
      )}
    </div>
  );
}
