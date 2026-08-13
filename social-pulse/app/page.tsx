'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { emptyLinkedIn, emptyInstagram, emptyFacebook } from '../lib/constants';
import { exportPDF } from '../lib/exportPdf';
import type { WeekEntry, TabId, PlatformKey, AppState, FormDraft } from '../lib/types';

import Header from '../components/Header';
import PulseBar from '../components/PulseBar';
import Tabs, { TAB_DEFS } from '../components/Tabs';
import OverviewTab from '../components/OverviewTab';
import PlatformTab from '../components/PlatformTab';
import CompareTab from '../components/CompareTab';
import DataModal from '../components/DataModal';

const INITIAL_STATE: Omit<AppState, 'weeks'> = {
  activeIndex: 0,
  tab: 'overview',
  compareTab: 'linkedin',
  chartMetric: { linkedin: 'impressions', instagram: 'reach', facebook: 'viewers' },
  formOpen: false,
  formWeekId: null,
  formSection: 'linkedin',
  _newWeekDate: null,
};

export default function DashboardPage() {
  const { session, loading, logout } = useAuth();
  const router = useRouter();

  const [weeks, setWeeks] = useState<WeekEntry[]>([]);
  const [state, setState] = useState<Omit<AppState, 'weeks'>>(INITIAL_STATE);
  const [draft, setDraft] = useState<FormDraft>({ linkedin: null, instagram: null, facebook: null });
  const [fetchingWeeks, setFetchingWeeks] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auth guard
  useEffect(() => {
    if (!loading && !session) {
      router.replace('/login');
    }
  }, [session, loading, router]);

  // Fetch weeks from MongoDB API
  useEffect(() => {
    if (session) {
      setFetchingWeeks(true);
      fetch('/api/weeks')
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && Array.isArray(data.weeks)) {
            setWeeks(data.weeks);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch weeks from MongoDB', err);
        })
        .finally(() => {
          setFetchingWeeks(false);
        });
    }
  }, [session]);

  const activeIndex = Math.min(state.activeIndex, Math.max(0, weeks.length - 1));
  const activeWeek = weeks[activeIndex] ?? weeks[0];
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

  const saveWeek = useCallback(
    async (weekId: string, savedDraft: FormDraft) => {
      const existing = weeks.find((w) => w.weekId === weekId);
      const entry: WeekEntry = {
        weekId,
        linkedin: { ...emptyLinkedIn(), ...(existing?.linkedin ?? {}), ...(savedDraft.linkedin ?? {}) } as WeekEntry['linkedin'],
        instagram: { ...emptyInstagram(), ...(existing?.instagram ?? {}), ...(savedDraft.instagram ?? {}) } as WeekEntry['instagram'],
        facebook: { ...emptyFacebook(), ...(existing?.facebook ?? {}), ...(savedDraft.facebook ?? {}) } as WeekEntry['facebook'],
      };

      // Save to MongoDB via API
      try {
        const res = await fetch('/api/weeks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
        const data = await res.json();
        if (data.ok && data.week) {
          setWeeks((prev) => {
            const idx = prev.findIndex((w) => w.weekId === weekId);
            let next: WeekEntry[];
            if (idx >= 0) {
              next = [...prev];
              next[idx] = data.week;
            } else {
              next = [...prev, data.week].sort((a, b) => a.weekId.localeCompare(b.weekId));
            }
            const newIdx = next.findIndex((w) => w.weekId === weekId);
            setState((s) => ({ ...s, activeIndex: newIdx, formOpen: false }));
            return next;
          });
        } else {
          alert(data.error || 'Failed to save week to MongoDB.');
        }
      } catch (err) {
        console.error('Save week error', err);
        alert('Network error while saving week.');
      }
    },
    [weeks]
  );

  // ── PDF Export ──
  const handleExportPdf = async () => {
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

  // ── JSON Import (Saves to MongoDB) ──
  const handleImport = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string) as WeekEntry[];
        if (!Array.isArray(imported)) throw new Error('not an array');

        const res = await fetch('/api/weeks/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weeks: imported }),
        });
        const data = await res.json();
        if (data.ok && Array.isArray(data.weeks)) {
          setWeeks(data.weeks);
          setState((s) => ({ ...s, activeIndex: data.weeks.length - 1 }));
          alert(`Successfully imported ${imported.length} week(s) to MongoDB!`);
        } else {
          alert(data.error || 'Failed to import weeks into MongoDB.');
        }
      } catch {
        alert("Couldn't read that file — make sure it's a valid JSON file.");
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // Show loading / auth redirect state
  if (loading || !session || fetchingWeeks || weeks.length === 0) {
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
            Connecting to MongoDB…
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
        onImport={handleImport}
        onExportPdf={handleExportPdf}
        onAdd={openForm}
        onLogout={logout}
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

      <div className="footnote">
        Data is securely stored in <b>MongoDB Cloud Database</b>. Use <b>Export PDF</b> to generate reports.
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
          onDraftChange={setDraft}
        />
      )}
    </div>
  );
}
