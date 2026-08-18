'use client';

import { useEffect, useRef, useState } from 'react';
import { PLATFORMS } from '../lib/constants';
import { formatWeekLabel, parseWeekRange, nextMonday, num } from '../lib/utils';
import { emptyLinkedIn, emptyInstagram, emptyFacebook } from '../lib/constants';
import type { WeekEntry, PlatformKey, FormDraft } from '../lib/types';

interface Props {
  weeks: WeekEntry[];
  formWeekId: string | null;
  formSection: string | null;
  newWeekDate: string | null;
  draft: FormDraft;
  onClose: () => void;
  onSelectFormWeek: (val: string) => void;
  onSetFormWeekDate: (val: string) => void;
  onToggleSection: (id: string) => void;
  onSave: (weekId: string, draft: FormDraft) => void;
  onDelete?: (weekId: string) => void;
  onDraftChange: (draft: FormDraft) => void;
}

export default function DataModal({
  weeks,
  formWeekId,
  formSection,
  newWeekDate,
  draft,
  onClose,
  onSelectFormWeek,
  onSetFormWeekDate,
  onToggleSection,
  onSave,
  onDelete,
  onDraftChange,
}: Props) {
  const isNew = formWeekId === null;
  const proposedDate = newWeekDate ?? nextMonday(weeks.length ? weeks[weeks.length - 1].weekId : null);
  const weekId = isNew ? proposedDate : formWeekId;
  const existing = weeks.find((w) => w.weekId === weekId);

  const initialRange = parseWeekRange(weekId || '');
  const [startDate, setStartDate] = useState<string>(initialRange.start || '');
  const [endDate, setEndDate] = useState<string>(initialRange.end || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync date range whenever weekId or formWeekId changes
  useEffect(() => {
    setConfirmDelete(false);
    if (weekId) {
      const range = parseWeekRange(weekId);
      setStartDate(range.start);
      setEndDate(range.end);
    }
  }, [weekId, formWeekId]);

  const li = draft.linkedin ?? (existing ? existing.linkedin : emptyLinkedIn());
  const ig = draft.instagram ?? (existing ? existing.instagram : emptyInstagram());
  const fb = draft.facebook ?? (existing ? existing.facebook : emptyFacebook());

  // Collect open section values into draft before re-render
  const sectionBodyRef = useRef<HTMLDivElement | null>(null);
  function captureDraft(): FormDraft {
    const newDraft = { ...draft };
    if (sectionBodyRef.current) {
      const section = sectionBodyRef.current.getAttribute('data-section') as PlatformKey;
      const inputs = sectionBodyRef.current.querySelectorAll<HTMLInputElement>('input[data-field]');
      const obj: Record<string, number> = {};
      inputs.forEach((inp) => { obj[inp.getAttribute('data-field')!] = num(inp.value); });
      newDraft[section] = obj as never;
    }
    return newDraft;
  }

  function handleSave() {
    const captured = captureDraft();
    let effectiveWeekId = weekId!;
    if (isNew) {
      if (startDate && endDate && startDate !== endDate) {
        effectiveWeekId = `${startDate}_to_${endDate}`;
      } else if (startDate) {
        effectiveWeekId = startDate;
      }
    }
    onSave(effectiveWeekId, captured);
  }

  function handleDelete() {
    if (weekId && onDelete) {
      onDelete(weekId);
    }
  }

  function handleToggle(id: string) {
    const captured = captureDraft();
    onDraftChange(captured);
    onToggleSection(id);
  }

  function handleSelectWeek(val: string) {
    const captured = captureDraft();
    onDraftChange(captured);
    onSelectFormWeek(val);
  }

  function handleStartDateChange(val: string) {
    setStartDate(val);
    let newEnd = endDate;
    if (val) {
      const d = new Date(val + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        const endD = new Date(d);
        endD.setDate(endD.getDate() + 6);
        newEnd = endD.toISOString().slice(0, 10);
        setEndDate(newEnd);
      }
    }
    const captured = captureDraft();
    onDraftChange(captured);
    const combinedId = val && newEnd && val !== newEnd ? `${val}_to_${newEnd}` : val;
    onSetFormWeekDate(combinedId);
  }

  function handleEndDateChange(val: string) {
    setEndDate(val);
    const captured = captureDraft();
    onDraftChange(captured);
    const combinedId = startDate && val && startDate !== val ? `${startDate}_to_${val}` : (startDate || val);
    onSetFormWeekDate(combinedId);
  }

  function SectionFields({ platformKey, values }: { platformKey: PlatformKey; values: Record<string, number> }) {
    const cfg = PLATFORMS[platformKey];
    if (cfg.groups) {
      return (
        <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cfg.groups.map((g) => (
            <div key={g.title} style={{ background: 'var(--surface-raised)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.accent }} />
                {g.title}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {g.fields.map((f) => (
                  <label className="field-label" key={f.key}>
                    {f.label}
                    <input
                      className="field-input"
                      type="number"
                      min="0"
                      placeholder="0"
                      data-field={f.key}
                      defaultValue={values[f.key] ?? 0}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <>
        {cfg.metrics.map((f) => (
          <label className="field-label" key={f.key}>
            {f.label}
            <input
              className="field-input"
              type="number"
              min="0"
              placeholder="0"
              data-field={f.key}
              defaultValue={values[f.key] ?? 0}
            />
          </label>
        ))}
      </>
    );
  }

  function Section({ id, label, accent, values }: { id: PlatformKey; label: string; accent: string; values: Record<string, number> }) {
    const open = formSection === id;
    return (
      <div className="section-block">
        <button type="button" className="section-toggle" onClick={() => handleToggle(id)}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="dot" style={{ background: accent }} />
            {label}
          </span>
          <span style={{ transition: 'transform .15s', transform: `rotate(${open ? 180 : 0}deg)` }}>▾</span>
        </button>
        {open && (
          <div className="section-body" data-section={id} ref={sectionBodyRef}>
            <SectionFields platformKey={id} values={values} />
          </div>
        )}
      </div>
    );
  }

  const weekOptions = [
    <option key="__new__" value="__new__">{isNew ? '+ Add New Week (selected)' : '+ Add New Week'}</option>,
    ...weeks.map((w) => (
      <option key={w.weekId} value={w.weekId}>Edit: {formatWeekLabel(w.weekId)}</option>
    )),
  ];

  const currentPreview = isNew
    ? (startDate ? formatWeekLabel(startDate && endDate ? `${startDate}_to_${endDate}` : startDate) : '')
    : formatWeekLabel(weekId!);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">{isNew ? 'Add new week' : 'Edit week'}</div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        <div className="week-select-wrap">
          <label className="field-label">
            Week
            <select
              className="field-input"
              value={formWeekId ?? '__new__'}
              onChange={(e) => handleSelectWeek(e.target.value)}
              id="form-week-select"
            >
              {weekOptions}
            </select>
          </label>
        </div>

        {isNew ? (
          <div className="week-select-wrap">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label className="field-label">
                Start Date
                <input
                  className="field-input"
                  type="date"
                  id="form-start-date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  required
                />
              </label>
              <label className="field-label">
                End Date
                <input
                  className="field-input"
                  type="date"
                  id="form-end-date"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  required
                />
              </label>
            </div>
            {currentPreview && (
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6, fontWeight: 500 }}>
                Range: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{currentPreview}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="week-select-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="week-static">Editing {formatWeekLabel(weekId!)}</div>
            {!confirmDelete ? (
              <button
                type="button"
                className="delete-btn"
                onClick={() => setConfirmDelete(true)}
                title="Remove entire week permanently"
                id="btn-delete-week"
              >
                🗑️ Remove Week
              </button>
            ) : null}
          </div>
        )}

        {confirmDelete && !isNew && (
          <div className="delete-confirm-box">
            <div className="delete-confirm-text">
              Are you sure you want to remove week <b>{formatWeekLabel(weekId!)}</b>? This will permanently delete its metrics.
            </div>
            <div className="delete-confirm-actions">
              <button type="button" className="delete-confirm-btn" onClick={handleDelete} id="btn-confirm-delete-week">
                Yes, Delete Week
              </button>
              <button type="button" className="delete-cancel-btn" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="preserve-note">
          ✓ Saving never overwrites other weeks — all {weeks.length} saved week{weeks.length !== 1 ? 's' : ''} stay intact for comparison.
        </div>

        <Section id="linkedin" label="LinkedIn" accent={PLATFORMS.linkedin.accent} values={li as Record<string, number>} />
        <Section id="instagram" label="Instagram" accent={PLATFORMS.instagram.accent} values={ig as Record<string, number>} />
        <Section id="facebook" label="Facebook" accent={PLATFORMS.facebook.accent} values={fb as Record<string, number>} />

        <div className="modal-actions">
          <button className="save-btn" onClick={handleSave} id="btn-save-week">
            💾 {isNew ? 'Save week' : 'Update week'}
          </button>
          <button className="cancel-btn" onClick={onClose} id="btn-cancel-week">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
