'use client';

import { formatWeekLabel } from '../lib/utils';
import type { WeekEntry } from '../lib/types';

interface Props {
  activeWeek?: WeekEntry;
  onImport: () => void;
  onExportPdf: () => void;
  onAdd: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pdfLoading?: boolean;
}

export default function Header({
  activeWeek,
  onImport,
  onExportPdf,
  onAdd,
  fileInputRef,
  onFileChange,
  pdfLoading,
}: Props) {
  return (
    <div className="header-row">
      <div>
        <div className="eyebrow">WEEKLY PERFORMANCE DASHBOARD</div>
        <div className="title">
          Social Pulse{' '}
          {activeWeek && <span className="week-range">{formatWeekLabel(activeWeek.weekId)}</span>}
        </div>
      </div>

      <div className="header-actions">
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: 'var(--up)',
            background: 'var(--up-soft)',
            padding: '5px 12px',
            borderRadius: 999,
            fontWeight: 600,
          }}
          title="All changes are automatically saved to local storage & database"
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--up)' }} />
          Auto-saved
        </div>

        <div className="header-divider" />

        <input
          type="file"
          ref={fileInputRef}
          accept="application/json"
          style={{ display: 'none' }}
          onChange={onFileChange}
          id="import-file-input"
        />
        <button className="btn" onClick={onImport} id="btn-import">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import
        </button>

        <button className="btn btn-pdf" onClick={onExportPdf} disabled={pdfLoading} id="btn-export-pdf">
          {pdfLoading ? (
            <span className="spin" style={{ fontSize: 13 }}>⟳</span>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          )}
          Export PDF
        </button>

        <button className="btn btn-primary" onClick={onAdd} id="btn-add-week">
          + Add / Edit Week
        </button>
      </div>
    </div>
  );
}
