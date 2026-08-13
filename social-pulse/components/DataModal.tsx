'use client';

import { useEffect, useRef, useState } from 'react';
import { PLATFORMS } from '../lib/constants';
import { formatWeekLabel, nextMonday, num } from '../lib/utils';
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

  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset delete confirmation whenever formWeekId changes
  useEffect(() => {
    setConfirmDelete(false);
  }, [formWeekId]);

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
    onSave(weekId!, captured);
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

  function handleSetDate(val: string) {
    const captured = captureDraft();
    onDraftChange(captured);
    onSetFormWeekDate(val);
  }

  function SectionFields({ platformKey, values }: { platformKey: PlatformKey; values: Record<string, number> }) {
    const cfg = PLATFORMS[platformKey];
    const fields = cfg.groups
      ? cfg.groups.flatMap((g) => g.fields)
      : cfg.metrics;
    return (
      <>
        {fields.map((f) => (
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
            <label className="field-label">
              Week starting (Mon)
              <input
                className="field-input"
                type="date"
                id="form-week-id"
                value={weekId}
                onChange={(e) => handleSetDate(e.target.value)}
              />
            </label>
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
              Are you sure you want to remove week starting <b>{formatWeekLabel(weekId!)}</b>? This will permanently delete its metrics.
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


