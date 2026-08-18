'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PLATFORMS, emptyLinkedIn, emptyInstagram, emptyFacebook } from '../lib/constants';
import { formatWeekLabel, parseWeekRange, nextMonday, num } from '../lib/utils';
import type { WeekEntry, PlatformKey, LinkedInData, InstagramData, FacebookData } from '../lib/types';

interface Props {
  weeks: WeekEntry[];
  formWeekId: string | null;
  formSection: string | null;
  newWeekDate: string | null;
  onClose: () => void;
  onSelectFormWeek: (val: string) => void;
  onSetFormWeekDate: (val: string) => void;
  onToggleSection: (id: string) => void;
  onSave: (weekId: string, data: { linkedin: LinkedInData; instagram: InstagramData; facebook: FacebookData }) => void;
  onDelete?: (weekId: string) => void;
}

type FormPlatformState = Record<string, number | string>;

// Top-level components (outside DataModal) to ensure React never unmounts/re-mounts inputs during keystrokes
function SectionFields({
  platformKey,
  values,
  onChangeField,
}: {
  platformKey: PlatformKey;
  values: FormPlatformState;
  onChangeField: (platform: PlatformKey, fieldKey: string, val: string) => void;
}) {
  const cfg = PLATFORMS[platformKey];
  if (cfg.groups) {
    return (
      <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {cfg.groups.map((g) => (
          <div
            key={g.title}
            style={{
              background: 'var(--surface-raised)',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid var(--border-soft)',
            }}
          >
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
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
                    value={values[f.key] !== undefined ? values[f.key] : ''}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => onChangeField(platformKey, f.key, e.target.value)}
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
            value={values[f.key] !== undefined ? values[f.key] : ''}
            onFocus={(e) => e.target.select()}
            onChange={(e) => onChangeField(platformKey, f.key, e.target.value)}
          />
        </label>
      ))}
    </>
  );
}

function Section({
  id,
  label,
  accent,
  values,
  isOpen,
  onToggle,
  onChangeField,
}: {
  id: PlatformKey;
  label: string;
  accent: string;
  values: FormPlatformState;
  isOpen: boolean;
  onToggle: (id: string) => void;
  onChangeField: (platform: PlatformKey, fieldKey: string, val: string) => void;
}) {
  return (
    <div className="section-block">
      <button type="button" className="section-toggle" onClick={() => onToggle(id)}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="dot" style={{ background: accent }} />
          {label}
        </span>
        <span style={{ transition: 'transform .15s', transform: `rotate(${isOpen ? 180 : 0}deg)` }}>▾</span>
      </button>
      {isOpen && (
        <div className="section-body">
          <SectionFields platformKey={id} values={values} onChangeField={onChangeField} />
        </div>
      )}
    </div>
  );
}

export default function DataModal({
  weeks,
  formWeekId,
  formSection,
  newWeekDate,
  onClose,
  onSelectFormWeek,
  onSetFormWeekDate,
  onToggleSection,
  onSave,
  onDelete,
}: Props) {
  const isNew = formWeekId === null;
  const proposedDate = newWeekDate ?? nextMonday(weeks.length ? weeks[weeks.length - 1].weekId : null);
  const weekId = isNew ? proposedDate : formWeekId;
  const existing = weeks.find((w) => w.weekId === weekId);

  const initialRange = parseWeekRange(weekId || '');
  const [startDate, setStartDate] = useState<string>(initialRange.start || '');
  const [endDate, setEndDate] = useState<string>(initialRange.end || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Controlled form state allowing string/number for seamless typing and erasing
  const [linkedin, setLinkedin] = useState<FormPlatformState>(() => ({
    ...(existing?.linkedin ?? emptyLinkedIn()),
  }));
  const [instagram, setInstagram] = useState<FormPlatformState>(() => ({
    ...(existing?.instagram ?? emptyInstagram()),
  }));
  const [facebook, setFacebook] = useState<FormPlatformState>(() => ({
    ...(existing?.facebook ?? emptyFacebook()),
  }));

  // Re-sync form state whenever weekId changes (e.g. switching between weeks in dropdown)
  useEffect(() => {
    setConfirmDelete(false);
    if (weekId) {
      const range = parseWeekRange(weekId);
      setStartDate(range.start);
      setEndDate(range.end);

      const target = weeks.find((w) => w.weekId === weekId);
      setLinkedin({ ...(target?.linkedin ?? emptyLinkedIn()) });
      setInstagram({ ...(target?.instagram ?? emptyInstagram()) });
      setFacebook({ ...(target?.facebook ?? emptyFacebook()) });
    }
  }, [weekId, formWeekId, weeks]);

  const handleFieldChange = useCallback((platform: PlatformKey, fieldKey: string, rawValue: string) => {
    const val = rawValue === '' ? '' : rawValue;
    if (platform === 'linkedin') {
      setLinkedin((prev) => ({ ...prev, [fieldKey]: val }));
    } else if (platform === 'instagram') {
      setInstagram((prev) => ({ ...prev, [fieldKey]: val }));
    } else if (platform === 'facebook') {
      setFacebook((prev) => ({ ...prev, [fieldKey]: val }));
    }
  }, []);

  function sanitizePlatformData<T>(obj: FormPlatformState): T {
    const clean: Record<string, number> = {};
    for (const k in obj) {
      clean[k] = num(obj[k]);
    }
    return clean as unknown as T;
  }

  function handleSave(e?: React.MouseEvent | React.FormEvent | React.KeyboardEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    let effectiveWeekId = weekId!;
    if (isNew) {
      if (startDate && endDate && startDate !== endDate) {
        effectiveWeekId = `${startDate}_to_${endDate}`;
      } else if (startDate) {
        effectiveWeekId = startDate;
      }
    }
    if (!effectiveWeekId) {
      alert('Please select a valid date range for the week.');
      return;
    }

    onSave(effectiveWeekId, {
      linkedin: sanitizePlatformData<LinkedInData>(linkedin),
      instagram: sanitizePlatformData<InstagramData>(instagram),
      facebook: sanitizePlatformData<FacebookData>(facebook),
    });
  }

  function handleDelete(e?: React.MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (weekId && onDelete) {
      onDelete(weekId);
    }
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
    const combinedId = val && newEnd && val !== newEnd ? `${val}_to_${newEnd}` : val;
    onSetFormWeekDate(combinedId);
  }

  function handleEndDateChange(val: string) {
    setEndDate(val);
    const combinedId = startDate && val && startDate !== val ? `${startDate}_to_${val}` : (startDate || val);
    onSetFormWeekDate(combinedId);
  }

  const weekOptions = [
    <option key="__new__" value="__new__">
      {isNew ? '+ Add New Week (selected)' : '+ Add New Week'}
    </option>,
    ...weeks.map((w) => (
      <option key={w.weekId} value={w.weekId}>
        Edit: {formatWeekLabel(w.weekId)}
      </option>
    )),
  ];

  const currentPreview = isNew
    ? startDate
      ? formatWeekLabel(startDate && endDate ? `${startDate}_to_${endDate}` : startDate)
      : ''
    : formatWeekLabel(weekId!);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSave(e);
          }
        }}
      >
        <div className="modal-head">
          <div className="modal-title">{isNew ? 'Add new week' : 'Edit week'}</div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        <div className="week-select-wrap">
          <label className="field-label">
            Week
            <select
              className="field-input"
              value={formWeekId ?? '__new__'}
              onChange={(e) => onSelectFormWeek(e.target.value)}
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

        <Section
          id="linkedin"
          label="LinkedIn"
          accent={PLATFORMS.linkedin.accent}
          values={linkedin}
          isOpen={formSection === 'linkedin'}
          onToggle={onToggleSection}
          onChangeField={handleFieldChange}
        />
        <Section
          id="instagram"
          label="Instagram"
          accent={PLATFORMS.instagram.accent}
          values={instagram}
          isOpen={formSection === 'instagram'}
          onToggle={onToggleSection}
          onChangeField={handleFieldChange}
        />
        <Section
          id="facebook"
          label="Facebook"
          accent={PLATFORMS.facebook.accent}
          values={facebook}
          isOpen={formSection === 'facebook'}
          onToggle={onToggleSection}
          onChangeField={handleFieldChange}
        />

        <div className="modal-actions">
          <button type="button" className="save-btn" onClick={handleSave} id="btn-save-week">
            💾 {isNew ? 'Save week' : 'Update week'}
          </button>
          <button type="button" className="cancel-btn" onClick={onClose} id="btn-cancel-week">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
