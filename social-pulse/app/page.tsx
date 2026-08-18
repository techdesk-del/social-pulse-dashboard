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
      if (item !== null) {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed)) {
          return parsed; // Can be [] if user deleted all weeks
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

  // Initialize data on mount
  useEffect(() => {
    const local = loadFromLocalStorage();
    if (local !== null) {
      setWeeks(local);
      setIsReady(true);
    } else {
      // First time ever visited: initialize with SEED_WEEKS
      setWeeks(SEED_WEEKS);
      saveToLocalStorage(SEED_WEEKS);
      setIsReady(true);
    }

    // Sync with MongoDB in background
    fetch('/api/weeks')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.weeks)) {
          if (local === null) {
            // First time seed
            if (data.weeks.length > 0) {
              setWeeks(data.weeks);
              saveToLocalStorage(data.weeks);
            }
          }
        }
      })
      .catch((err) => {
        console.warn('Database sync note:', err);
      });
  }, []);

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
    // If targetWeekId is explicitly provided, use it. Otherwise, default to editing the currently active week
    const weekToEdit = targetWeekId !== undefined ? targetWeekId : (weeks[activeIndex]?.weekId ?? null);
    setDraft({ linkedin: null, instagram: null, facebook: null });
    setState((s) => ({
      ...s,
      formOpen: true,
      formWeekId: weekToEdit,
      _newWeekDate: null,
      formSection: 'linkedin',
    }));
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

      // 1. Update state and localStorage
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
        console.warn('MongoDB sync note:', err);
      }
    },
    [weeks]
  );

  // ── Delete Week: Permanently removes from state, localStorage & MongoDB ──
  const deleteWeek = useCallback(
    async (weekId: string) => {
      const updatedList = weeks.filter((w) => w.weekId !== weekId);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string) as WeekEntry[];
        if (!Array.isArray(imported)) throw new Error('not an array');

        const map = new Map<string, WeekEntry>();
        weeks.forEach((w) => map.set(w.weekId, w));
        imported.forEach((w) => {
          if (w && w.weekId) map.set(w.weekId, w);
        });

        const merged = Array.from(map.values()).sort((a, b) => a.weekId.localeCompare(b.weekId));
        setWeeks(merged);
        saveToLocalStorage(merged);
        setState((s) => ({ ...s, activeIndex: merged.length - 1 }));

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

  if (!isReady) {
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
